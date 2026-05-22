import { srcFontDir } from "../helpers";
import Provider from "../models/provider";
import { BitmapGlyph } from "../models/renderers/bitmap-glyph";
import Canvas from "@napi-rs/canvas/node-canvas";
import fs from "fs/promises";
import path from "path";
import { PNG } from "pngjs";
import util from "util";

if (typeof require.main == "undefined")
  throw "This file cannot be run dynamically!";

const BASE_TEXTURES_DIR = srcFontDir("assets", "textures");
const parsePNG = util.promisify(PNG.prototype.parse);

function getImageAlpha(image: PNG, x: number, y: number): number | undefined {
  const index = (x + y * image.width) * 4 + 3;

  return image.data[index];
}

function getActualGlyphWidth(
  image: PNG,
  width: number,
  height: number,
  index: number,
  rowIndex: number,
) {
  let m: number;

  for (m = width - 1; m >= 0; --m) {
    let n = index * width + m;

    for (let o = 0; o < height; ++o) {
      let p = rowIndex * height + o;

      if (getImageAlpha(image, n, p) !== 0) {
        return m + 1;
      }
    }
  }

  return m + 1;
}

type creationOpts = {
  height?: number;
  ascent: number;
  chars: string[];
  file: string;
};

export async function create({
  height = 8,
  ascent,
  chars,
  file,
}: creationOpts): Promise<Provider<BitmapGlyph>> {
  if (ascent > height) {
    throw new Error(`Ascent ${ascent} higher than height ${height}`);
  }

  for (const element of chars) {
    const thisCodepoints = Array.from(element);
    const firstCodepoints = Array.from(chars[0]);

    if (thisCodepoints.length !== firstCodepoints.length) {
      throw new Error(
        `Elements of chars have to be the same length (found: ${thisCodepoints.length}, expected: ${firstCodepoints.length}), pad with space or \\u0000`,
      );
    }
  }

  if (!chars.length || !chars[0].length) {
    throw new Error("Expected to find data in chars, found none.");
  }

  const url = path.join(BASE_TEXTURES_DIR, file.slice(file.indexOf(":") + 1));
  const texture = await fs.readFile(url);
  const image = await parsePNG.call(new PNG(), texture);
  const canvasImage = await Canvas.loadImage(url);

  const glyphs: Record<string, BitmapGlyph> = {};
  const imageWidth = image.width;
  const imageHeight = image.height;
  const glyphWidth = Math.floor(imageWidth / chars[0].length);
  const glyphHeight = Math.floor(imageHeight / chars.length);

  for (let rowIndex = 0; rowIndex < chars.length; rowIndex++) {
    const codepoints = Array.from(chars[rowIndex]);

    for (let index = 0; index < codepoints.length; index++) {
      const char = codepoints[index];

      if (char === "\x00" || char === " ") {
        continue;
      }

      const actualWidth = getActualGlyphWidth(
        image,
        glyphWidth,
        glyphHeight,
        index,
        rowIndex,
      );

      if (actualWidth === 0) {
        continue;
      }

      const visualScale = height / glyphHeight;
      const contentScale = height / actualWidth;

      const scale = Math.min(visualScale, contentScale * 0.9);

      glyphs[char] = {
        scale,
        offsetX: Math.floor(index * glyphWidth),
        offsetY: Math.floor(rowIndex * glyphHeight),
        width: glyphWidth,
        height: glyphHeight,
        advance: Math.trunc(0.5 + actualWidth * scale) + 1,
        ascent,
        boldOffset: ["✫", "✪", "⚝", "✥", "✭"].includes(char) ? 0 : undefined,
        shadowOffset: char === "✭" ? 0 : undefined,
        render(context, x, y, color) {
          const { offsetX, offsetY, width, height, ascent } = this;
          const bufferCanvas = Canvas.createCanvas(width, height);
          const bufferContext = bufferCanvas.getContext("2d");

          bufferContext.imageSmoothingEnabled = false;
          bufferContext.fillStyle = color;
          bufferContext.fillRect(0, 0, width, height);
          bufferContext.globalCompositeOperation = "destination-in";
          bufferContext.drawImage(
            canvasImage,
            offsetX,
            offsetY,
            Math.floor(width),
            Math.floor(height),
            0,
            0,
            width,
            height,
          );

          const scaledWidth = width * this.scale;
          const scaledHeight = height * this.scale;

          context.drawImage(
            bufferCanvas,
            x,
            y + (7 - ascent),
            scaledWidth,
            scaledHeight,
          );
        },
      };
    }
  }

  return {
    getGlyph(char: string) {
      return glyphs[char];
    },
  };
}

import { getFontSet, loadFontSets } from "./font-manager";
import { iterateFormatted } from "./helpers";
import BitmapGlyph from "./models/renderers/bitmap-glyph";
import Canvas, { CanvasRenderingContext2D } from "canvas";

const DEFAULT_SCALE = 2;
const DEFAULT_LINE_HEIGHT = 10;
const DEFAULT_HORIZONTAL_PADDING = 2;
const DEFAULT_VERTICAL_PADDING = 2;

let fontSetLoadPromise: Promise<void> | null = null;

async function ensureFontSetsLoaded(): Promise<void> {
  if (!fontSetLoadPromise) {
    fontSetLoadPromise = loadFontSets();
  }

  await fontSetLoadPromise;
}

export function fetchMinecraftAssets(): never {
  // Fetch the assets from the Minecraft cdn instead but im lazy as fuck
  throw "Not implemented!";
}

export function measureMinecraftText(text: string, font?: string) {
  const fontSet = getFontSet(font);
  if (fontSet === undefined) {
    throw Error(`font '${font}' is undefined`);
  }
  let width = 0;

  iterateFormatted(text, (style, char) => {
    const glyph = fontSet.getGlyph(char);
    const { advance, boldOffset = 1 } = glyph as BitmapGlyph;

    width += advance + (style.bold ? boldOffset : 0);
  });

  return width;
}

export function drawMinecraftText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  scale: number = 1,
  font?: string,
) {
  const fontSet = getFontSet(font);

  if (fontSet === undefined) {
    throw Error(`font '${font}' is undefined`);
  }

  context.save();
  context.scale(scale, scale);
  context.imageSmoothingEnabled = false;

  iterateFormatted(text, (style, char) => {
    const glyph = fontSet.getGlyph(char);
    const { advance, boldOffset = 1, shadowOffset = 1 } = glyph as BitmapGlyph;

    if (!glyph.empty) {
      glyph.render(
        context,
        x + shadowOffset,
        y + shadowOffset,
        style.color!.shadow,
      );

      if (style.bold) {
        glyph.render(
          context,
          x + shadowOffset + boldOffset,
          y + shadowOffset,
          style.color!.shadow,
        );
      }

      glyph.render(context, x, y, style.color!.text);

      if (style.bold) {
        glyph.render(context, x + boldOffset, y, style.color!.text);
      }
    }

    x += advance + (style.bold ? boldOffset : 0);
  });

  context.restore();
}

export async function generateMinecraftText(
  lines: string[],
  transparentBackground = false,
  input_scale?: number,
  font?: string,
): Promise<Buffer> {
  const scale = input_scale ?? DEFAULT_SCALE;

  await ensureFontSetsLoaded();

  const safeLines = lines.length ? lines : [""];
  const maxLineWidth = Math.max(
    ...safeLines.map((line) => measureMinecraftText(line, font)),
    0,
  );

  const width = Math.max(
    1,
    (maxLineWidth + DEFAULT_HORIZONTAL_PADDING * 2) * scale,
  );
  const height = Math.max(
    1,
    (safeLines.length * DEFAULT_LINE_HEIGHT + DEFAULT_VERTICAL_PADDING * 2) *
      scale,
  );

  const canvas = Canvas.createCanvas(width, height);
  const context = canvas.getContext("2d");
  context.imageSmoothingEnabled = false;

  if (!transparentBackground) {
    context.fillStyle = "#000000";
    context.fillRect(0, 0, width, height);
  }

  safeLines.forEach((line, index) => {
    drawMinecraftText(
      context,
      line,
      DEFAULT_HORIZONTAL_PADDING,
      DEFAULT_VERTICAL_PADDING + index * DEFAULT_LINE_HEIGHT,
      scale,
      font,
    );
  });

  return canvas.toBuffer("image/png");
}

export { Canvas };

import Renderer from "../renderer";
import { Image } from "@napi-rs/canvas/node-canvas";

export type MissingGlyph = {
  width: number;
  height: number;
  advance: number;
  image: Image | null;
} & Renderer;

export default MissingGlyph;

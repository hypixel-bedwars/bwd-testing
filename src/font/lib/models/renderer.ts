import { CanvasRenderingContext2D } from "@napi-rs/canvas/node-canvas";

export interface Renderer {
  empty?: boolean;
  render(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: CanvasRenderingContext2D["fillStyle"],
  ): void;
}
export default Renderer;

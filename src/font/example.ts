import { loadFontSets } from "./lib/font-manager";
import { drawMinecraftText } from "./lib/index";
import Canvas from "canvas";
import fs from "fs/promises";

const canvas = Canvas.createCanvas(1000, 1000);
const context = canvas.getContext("2d");

(async () => {
  await loadFontSets();

  // background
  context.fillStyle = "#111";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // BASIC ASCII
  drawMinecraftText(context, "§aHello world!", 10, 10, 2);

  // FORMATTING TEST
  drawMinecraftText(context, "§6§lBold Text!", 10, 40, 2);
  drawMinecraftText(context, "§cRed §aGreen §bBlue", 10, 70, 2);
  
  // MIXED TEST
  drawMinecraftText(
    context,
    "§dMix: Hello ✨ World ☀ ✔ ✂",
    10,
    160,
    2
  );

  // STRESS TEST (spacing + scaling)
  drawMinecraftText(
    context,
    "§fSymbols: ★ ☆ ⚝ ➜ ➤ ➥",
    10,
    220,
    2
  );

  await fs.writeFile("test-output.png", canvas.toBuffer());

  console.log("✅ Test image saved as test-output.png");
})();
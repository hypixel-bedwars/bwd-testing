import { generateMinecraftText } from "../font/lib";
import { formatStars, HypixelPlayer } from "../model/hypixel/player.hypixel";
import fs from "fs";

const STEP = 100;
const LENGTH = 51;

const stars = Array.from({ length: LENGTH }, (_, i) => i * STEP);

const formattedstars = stars.map((star) =>
  formatStars({ stars: star } as HypixelPlayer)
);

generateMinecraftText(formattedstars, true, 3).then((buffer) => {
  const currentpath = __dirname;
  fs.writeFileSync(`${currentpath}/data/prestiges.png`, buffer);
});
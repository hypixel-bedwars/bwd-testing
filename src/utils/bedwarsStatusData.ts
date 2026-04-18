import fs from "fs";
import path from "path";
import { logger } from "../logger";

const FILE_PATH = path.join(process.cwd(), "data", "bedwarsStatus.json");

export interface BedwarsStatusData {
  channelId: string;
  messageId: string;
}

export function readBedwarsStatusData(): BedwarsStatusData | null {
  try {
    if (!fs.existsSync(FILE_PATH)) return null;
    return JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));
  } catch {
    logger.info("Bedwars status data corrupted, resetting...");
    return null;
  }
}

export function writeBedwarsStatusData(data: BedwarsStatusData) {
  try {
    const dir = path.dirname(FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
  } catch {
    logger.error("Failed to write bedwars status data");
  }
}

export function clearBedwarsStatusData() {
  try {
    if (fs.existsSync(FILE_PATH)) fs.unlinkSync(FILE_PATH);
  } catch {
    logger.error("Failed to clear bedwars status data");
  }
}

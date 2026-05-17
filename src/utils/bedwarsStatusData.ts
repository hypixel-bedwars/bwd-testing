import { logger } from "../logger";
import { readData, writeData } from "./dataReader";
import { getDb } from "./db";

const STORE_KEY = "bedwarsStatus";

export interface BedwarsStatusData {
  channelId: string;
  messageId: string;
}

export async function readBedwarsStatusData(): Promise<BedwarsStatusData | null> {
  try {
    return await readData<BedwarsStatusData>(STORE_KEY);
  } catch {
    logger.info("Bedwars status data corrupted, resetting...");
    return null;
  }
}

export async function writeBedwarsStatusData(data: BedwarsStatusData) {
  try {
    await writeData(STORE_KEY, data);
  } catch {
    logger.error("Failed to write bedwars status data");
  }
}

export async function clearBedwarsStatusData() {
  try {
    const db = getDb();
    db.prepare("DELETE FROM json_store WHERE name = ?").run(STORE_KEY);
  } catch {
    logger.error("Failed to clear bedwars status data");
  }
}

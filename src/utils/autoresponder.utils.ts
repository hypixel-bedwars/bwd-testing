import path from "path";
import { autoResponderData } from "../model/autoresponder.model";
import fs from "fs";
import { logger } from "../logger";

const FILE_PATH = path.join(process.cwd(), "data", "autoresponder.json");

export function getAutoResponderData(): autoResponderData {
  try {
    if (!fs.existsSync(FILE_PATH)) return {};
    return JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));
  } catch {
    logger.warn("Data for auto response corrupted, resetting...");
    return {};
  }
}

export function addOrUpdateAutoResponder(
  userId: string,
  username: string,
  response: string
): { success: boolean; reason?: string } {
  const dir = path.dirname(FILE_PATH);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let data: autoResponderData = {};

  if (fs.existsSync(FILE_PATH)) {
    try {
      data = JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));
    } catch {
      logger.warn("Corrupted data, resetting...");
    }
  }

  const normalizedUsername = username.toLowerCase();

  const duplicate = Object.values(data).find(
    (entry) =>
      entry.username.toLowerCase() === normalizedUsername &&
      entry.userId !== userId
  );

  if (duplicate) {
    return { success: false, reason: "USERNAME_EXISTS" };
  }

  data[userId] = {
    userId,
    username,
    response,
  };

  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
  
  logger.info("Added or updated auto responder for user %s", username);
  logger.discord(`Added or updated auto responder for user ${username}`);
  return { success: true };
}

export function removeAutoResponseUsername(username: string): boolean {
  const data = getAutoResponderData();
  const normalizedUsername = username.toLowerCase();

  // Find the ID (key) where the username matches
  const userIdToDelete = Object.keys(data).find(
    (key) => data[key].username.toLowerCase() === normalizedUsername
  );

  if (!userIdToDelete) return false;

  delete data[userIdToDelete];

  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
  
  logger.discord(`Removed auto responder for user ${username}`);
  return true;
}

export function removeAutoResponderById(userId: string): boolean {
  const data = getAutoResponderData();

  if (!(userId in data)) return false;

  delete data[userId];

  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));

  return true;
}
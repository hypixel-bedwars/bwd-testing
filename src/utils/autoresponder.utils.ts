import { autoResponderData } from "../model/autoresponder.model";
import { logger } from "../logger";
import { readData, writeData } from "./dataReader";

const FILE_NAME = "autoresponder";

export async function getAutoResponderData(): Promise<autoResponderData> {
  const data = await readData<autoResponderData>(FILE_NAME);

  if (!data) {
    logger.warn("Auto responder data missing or corrupted, resetting...");
    // Persist an empty object so we don't warn on every message.
    await writeData(FILE_NAME, {} as autoResponderData);
    return {};
  }

  return data;
}

export async function addOrUpdateAutoResponder(
  userId: string,
  username: string,
  response: string
): Promise<{ success: boolean; reason?: string }> {
  const data = await getAutoResponderData();

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

  await writeData(FILE_NAME, data);

  logger.info("Added or updated auto responder for user %s", username);
  logger.discord(`Added or updated auto responder for user ${username}`);

  return { success: true };
}

export async function removeAutoResponseUsername(
  username: string
): Promise<boolean> {
  const data = await getAutoResponderData();
  const normalizedUsername = username.toLowerCase();

  const userIdToDelete = Object.keys(data).find(
    (key) => data[key].username.toLowerCase() === normalizedUsername
  );

  if (!userIdToDelete) return false;

  delete data[userIdToDelete];

  await writeData(FILE_NAME, data);

  logger.discord(`Removed auto responder for user ${username}`);
  return true;
}

export async function removeAutoResponderById(
  userId: string
): Promise<boolean> {
  const data = await getAutoResponderData();

  if (!(userId in data)) return false;

  delete data[userId];

  await writeData(FILE_NAME, data);

  return true;
}

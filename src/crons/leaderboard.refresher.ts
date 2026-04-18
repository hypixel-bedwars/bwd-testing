// utils/updateLeaderboards.ts
import { Client, ChannelType } from "discord.js";
import { generateAllLeaderboards, getLeaderboardMessageId } from "../utils/leaderboards";
import { getConfig } from "../utils/envloader";
import cron from "node-cron";
import { logger } from "../logger";

export async function updateLeaderboards(client: Client) {
  const config = getConfig();

  const types = [
    { key: "stars", channelId: config.StarsLeaderboardChannelId },
    { key: "wins", channelId: config.WinsLeaderboardChannelId },
    { key: "fkills", channelId: config.FkillsLeaderboardChannelId },
  ];

  const validTargets: {
    key: string;
    channel: any;
    messageId: string;
  }[] = [];

  for (const type of types) {
    const stored = getLeaderboardMessageId(type.key as any);
    if (!stored) continue;

    try {
      const channel = await client.channels.fetch(type.channelId);
      if (!channel || channel.type !== ChannelType.GuildText) continue;

      await channel.messages.fetch(stored.messageId);

      validTargets.push({
        key: type.key,
        channel,
        messageId: stored.messageId,
      });
    } catch {
      logger.info(`${type.key} message missing`);
      logger.discord(`The leaderboard message for ${type.key} is missing`);
    }
  }

  if (validTargets.length === 0) {
    logger.info("No valid leaderboard messages found. Skipping update.");
    return;
  }

  const leaderboards = await generateAllLeaderboards();
  if (!leaderboards) return;
  
  for (const target of validTargets) {
    const { key, channel, messageId } = target;

    let images;
    if (key === "stars") images = leaderboards.star_leaderboard;
    if (key === "wins") images = leaderboards.wins_leaderboard;
    if (key === "fkills") images = leaderboards.fkills_leaderboard;

    if (!images) continue;

    const embeds = images.map((_, i) => ({
      image: { url: `attachment://${key}_${i}.png` },
    }));

    const files = images.map((img, i) => ({
      attachment: img,
      name: `${key}_${i}.png`,
    }));

    try {
      const msg = await channel.messages.fetch(messageId);

      const timestamp = Math.floor(Date.now() / 1000);
      await msg.edit({
        content: `<a:minecraft_clock:1494647774267048056> Updated <t:${timestamp}:R> (<t:${timestamp}:f>)`,
        embeds,
        files,
      });

      logger.info(`${key} leaderboard updated`);
    } catch (err) {
      logger.error({err: err},`Failed to update ${key}`);
    }
  }

  logger.info("Leaderboards updated");
}

export function startLeaderboardCron(client: Client) {
  // 🔧 CHANGE THIS VALUE WHEN YOU WANT
  // const schedule = "*/5 * * * *"; // every 5 minutes (testing)
  const schedule = "*/30 * * * *"; // every 30 minutes (production)

  const task = cron.schedule(
    schedule,
    async () => {
      logger.info(`Leaderboards running (${schedule})`);

      try {
        await updateLeaderboards(client);
      } catch (err) {
        logger.error({err: err},`Failed to update leaderboards`);
      }
    },
    {
      timezone: "UTC",
    }
  );

  return task;
}
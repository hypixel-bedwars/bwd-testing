import { Client } from "discord.js";
import { startLeaderboardCron } from "../crons/leaderboard.refresher";
import { startBedwarsStatusCron } from "../crons/bedwarsStatus.refresher";
import { logger } from "../logger";
import { getConfig } from "../utils/envloader";

export default {
  name: "clientReady",
  once: true,
  async execute(client: Client) {
    logger.info(`Logged in as ${client.user?.tag}`);

    try {
      const channel = await client.channels.fetch(
        getConfig().DiscordLogChannelId,
      );

      if (!channel) {
        logger.error("Failed to fetch logging channel");
        return;
      }

      if (!channel.isTextBased()) {
        logger.error(
          { type: channel.type },
          "Logging channel is not text-based",
        );
        return;
      }

      logger.setDiscordChannel(channel);

      await logger.discord("Bot is online and ready to be used");
    } catch (err) {
      logger.error({ err }, "Failed to initialize Discord logging");
    }

    startLeaderboardCron(client);
    startBedwarsStatusCron(client);
  },
};

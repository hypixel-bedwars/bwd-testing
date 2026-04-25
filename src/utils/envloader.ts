import "dotenv/config";
import AppConfig from "../model/appconfig";

let cachedConfig: AppConfig | null = null;

export function initEnv(): void {
  if (cachedConfig) return; // prevent re-init

  const {
    CLIENT_ID,
    GUILD_ID,
    TOKEN,
    DEVE_ID,
    HYPIXEL_TOKEN,
    STARS_LEADERBOARD,
    WINS_LEADERBOARD,
    FKILLS_LEADERBOARD,
    BEDWARS_STATUS,
    DISCORD_LOG,
    TICKETS_CATEGORY,
  } = process.env;

  if (
    !CLIENT_ID ||
    !GUILD_ID ||
    !TOKEN ||
    !DEVE_ID ||
    !HYPIXEL_TOKEN ||
    !STARS_LEADERBOARD ||
    !WINS_LEADERBOARD ||
    !FKILLS_LEADERBOARD ||
    !BEDWARS_STATUS ||
    !DISCORD_LOG ||
    !TICKETS_CATEGORY
  ) {
    throw new Error(
      "Missing required environment variables. Please set all the channel IDs.",
    );
  }

  cachedConfig = {
    ClientId: CLIENT_ID,
    GuildId: GUILD_ID,
    Token: TOKEN,
    DevId: DEVE_ID,
    HypixelToken: HYPIXEL_TOKEN,
    StarsLeaderboardChannelId: STARS_LEADERBOARD,
    WinsLeaderboardChannelId: WINS_LEADERBOARD,
    FkillsLeaderboardChannelId: FKILLS_LEADERBOARD,
    BedwarsStatusChannelId: BEDWARS_STATUS,
    DiscordLogChannelId: DISCORD_LOG,
    TicketsCategoryId: TICKETS_CATEGORY,
  };
}

export function getConfig(): AppConfig {
  if (!cachedConfig) {
    throw new Error("Config not initialized. Call initEnv() first.");
  }

  return cachedConfig;
}

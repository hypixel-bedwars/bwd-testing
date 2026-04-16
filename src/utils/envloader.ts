import "dotenv/config";
import AppConfig from "../model/appconfig";

let cachedConfig: AppConfig | null = null;

export function initEnv(): void {
	if (cachedConfig) return; // prevent re-init

	const { CLIENT_ID, GUILD_ID, TOKEN, DEVE_ID, HYPIXEL_TOKEN } = process.env;

	if (!CLIENT_ID || !GUILD_ID || !TOKEN || !DEVE_ID || !HYPIXEL_TOKEN) {
		throw new Error(
			"Missing required environment variables. Please set CLIENT_ID, GUILD_ID, and TOKEN.",
		);
	}

	cachedConfig = {
		ClientId: CLIENT_ID,
		GuildId: GUILD_ID,
		Token: TOKEN,
		DevId: DEVE_ID,
		HypixelToken: HYPIXEL_TOKEN,
	};
}

export function getConfig(): AppConfig {
	if (!cachedConfig) {
		throw new Error("Config not initialized. Call initEnv() first.");
	}

	return cachedConfig;
}

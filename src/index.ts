import { Client, GatewayIntentBits } from "discord.js";
import initializeBot from "./bot";
import { getConfig } from "./utils/envloader";
import { logger } from "./logger";

async function main() {
	const client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent,
		],
	});

	await initializeBot(client);

	const { Token } = getConfig();
	client.login(Token);
}

main().catch((error) => {
  logger.error({ err: error }, "Critical failure during startup");
  logger.discord("Critical failure during startup: " + error);
  process.exit(1);
});
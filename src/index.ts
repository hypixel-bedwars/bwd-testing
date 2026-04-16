import { Client, GatewayIntentBits } from "discord.js";
import initializeBot from "./bot";
import { getConfig } from "./utils/envloader";

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
	console.error("Error starting the bot:", error);
});

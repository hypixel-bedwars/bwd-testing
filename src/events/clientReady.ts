import { Client } from "discord.js";
import { startLeaderboardCron } from "../crons/leaderboard.refresher";

export default {
	name: "clientReady",
	once: true,
	execute(client: Client) {
    console.log(`Logged in as ${client.user?.tag}`);
		startLeaderboardCron(client);
	},
};

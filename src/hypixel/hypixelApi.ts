import { getConfig } from "../utils/envloader";
import { attachAll, PlayerResponse } from "../model/hypixel/player.hypixel"
import { LeaderboardResponse } from "../model/hypixel/leaderboards.hypixel"

function getHypixelToken() {
	return getConfig().HypixelToken;
}

export default {
	async getBedwarsLeaderboards() {
		try {
			const url = `https://api.hypixel.net/v2/leaderboards?key=${getHypixelToken()}`;

			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`HTTP Error: ${response.status}`);
			}

			const requestData: LeaderboardResponse = await response.json();

			if (!requestData.success) {
				throw new Error(`Hypixel API returned success=false`);
			}

			return requestData.leaderboards["BEDWARS"] ?? null;
		} catch (err) {
			console.error("Failed to fetch Bedwars leaderboards:", err);
			return null;
		}
	},

	async getPlayerData(playeruuid: string) {
		try {
			const url = `https://api.hypixel.net/v2/player?key=${getHypixelToken()}&uuid=${playeruuid}`;

			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`HTTP Error: ${response.status}`);
			}

			const responseData: PlayerResponse = await response.json();

			if (!responseData.success) {
				throw new Error("Hypixel API returned success=false");
			}

			if (!responseData.player) {
				console.warn("Player not found:", playeruuid);
				return null;
			}

			return attachAll(responseData.player);

		} catch (err) {
			console.error("Failed to fetch Player Data:", err);
			return null;
		}
	},
};

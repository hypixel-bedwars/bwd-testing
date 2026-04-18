import { getConfig } from "../utils/envloader";
import { attachAll, PlayerResponse } from "../model/hypixel/player.hypixel"
import { LeaderboardResponse } from "../model/hypixel/leaderboards.hypixel"
import { logger } from "../logger";

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
			logger.error({err: err}, "Failed to fetch Bedwars leaderboards:");
			return null;
		}
	},

	async getPlayerData(playeruuid: string) {
    try {
      logger.info(`Fetching player data for ${playeruuid}...`);
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
				logger.warn(`Player not found: ${playeruuid}`);
				return null;
			}

			return attachAll(responseData.player);

		} catch (err) {
			logger.error({err: err}, "Failed to fetch Player Data:");
			return null;
		}
	},
};

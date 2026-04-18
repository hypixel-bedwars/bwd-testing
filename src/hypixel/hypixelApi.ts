import { getConfig } from "../utils/envloader";
import { attachAll, PlayerResponse } from "../model/hypixel/player.hypixel";
import { LeaderboardResponse } from "../model/hypixel/leaderboards.hypixel";
import { logger } from "../logger";
import {
  PlayerCountResponse,
  BedwarsMode,
} from "../model/hypixel/player_count.hypixel";
import { GamesResponse } from "../model/hypixel/games.hypixel";

function getHypixelToken() {
  return getConfig().HypixelToken;
}

export default {
  async getBedwarsLeaderboards() {
    try {
      const url = `https://api.hypixel.net/v2/leaderboards?key=${getHypixelToken()}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data: LeaderboardResponse = await response.json();
      if (!data.success) throw new Error(`Hypixel API returned success=false`);

      return data.leaderboards["BEDWARS"] ?? null;
    } catch (err) {
      logger.error({ err }, "Failed to fetch Bedwars leaderboards:");
      return null;
    }
  },

  async getPlayerData(playeruuid: string) {
    try {
      logger.info(`Fetching player data for ${playeruuid}...`);

      const url = `https://api.hypixel.net/v2/player?key=${getHypixelToken()}&uuid=${playeruuid}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data: PlayerResponse = await response.json();

      if (!data.success) throw new Error("Hypixel API returned success=false");
      if (!data.player) return null;

      return attachAll(data.player);
    } catch (err) {
      logger.error({ err }, "Failed to fetch Player Data:");
      return null;
    }
  },

  
  async getBedwarsPlayerCount() {
    try {
      const url = `https://api.hypixel.net/v2/counts?key=${getHypixelToken()}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data: PlayerCountResponse = await response.json();
      if (!data.success) throw new Error("Hypixel API returned success=false");

      return data.games.BEDWARS; 
    } catch (err) {
      logger.error({ err }, "Failed to fetch Bedwars player count:");
      return null;
    }
  },

  async getGames() {
    try {
      const url = `https://api.hypixel.net/v2/resources/games?key=${getHypixelToken()}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data: GamesResponse = await response.json();
      if (!data.success) throw new Error("Hypixel API returned success=false");

      return data.games.BEDWARS;
    } catch (err) {
      logger.error({ err }, "Failed to fetch games:");
      return null;
    }
  },

  async getBedwarsRotations() {
    const [counts, games] = await Promise.all([
      this.getBedwarsPlayerCount(),
      this.getGames(),
    ]);

    if (!counts || !games) return null;

    return Object.entries(counts.modes ?? {})
      .filter(([_, players]) => players > 0)
      .map(([mode, players]) => {
        const m = mode as BedwarsMode;

        return {
          mode: m,
          name: games.modeNames[m], 
          players,
        };
      })
      .sort((a, b) => b.players - a.players);
  },
};
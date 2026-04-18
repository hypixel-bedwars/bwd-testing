import { BedwarsMode } from "./player_count.hypixel";

export interface BedwarsGame {
  id: 58;
  name: "Bed Wars";
  databaseName: "Bedwars";
  modeNames: Record<BedwarsMode, string>;
}

export interface GamesResponse {
  success: boolean;
  lastUpdated: number;

  games: {
    BEDWARS: BedwarsGame;
  } & Record<string, any>;
}
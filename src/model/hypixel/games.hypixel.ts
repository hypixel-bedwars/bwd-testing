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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } & Record<string, any>;
}
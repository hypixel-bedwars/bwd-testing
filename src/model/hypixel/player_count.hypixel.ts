// ==========================
// Bedwars Modes (IntelliSense)
// ==========================
export type BedwarsMode =
  | "BEDWARS_TWO_FOUR"
  | "BEDWARS_TWO_FOUR_TOURNEY"
  | "BEDWARS_EIGHT_TWO_RUSH"
  | "BEDWARS_FOUR_FOUR_ARMED"
  | "BEDWARS_EIGHT_TWO_UNDERWORLD"
  | "BEDWARS_EIGHT_TWO_SWAP"
  | "BEDWARS_EIGHT_TWO"
  | "BEDWARS_FOUR_FOUR"
  | "BEDWARS_FOUR_FOUR_UNDERWORLD"
  | "BEDWARS_EIGHT_ONE_RUSH"
  | "BEDWARS_FOUR_FOUR_ULTIMATE"
  | "BEDWARS_FOUR_FOUR_TOURNEY"
  | "BEDWARS_EIGHT_TWO_LUCKY"
  | "BEDWARS_PRACTICE"
  | "BEDWARS_FOUR_THREE"
  | "BEDWARS_FOUR_FOUR_LUCKY"
  | "BEDWARS_CASTLE"
  | "BEDWARS_TWO_ONE_DUELS"
  | "BEDWARS_EIGHT_TWO_TOURNEY"
  | "BEDWARS_TWO_ONE_DUELS_RUSH"
  | "BEDWARS_EIGHT_ONE"
  | "BEDWARS_FOUR_FOUR_RUSH"
  | "BEDWARS_EIGHT_ONE_ONEBLOCK"
  | "BEDWARS_EIGHT_TWO_VOIDLESS"
  | "BEDWARS_EIGHT_TWO_ARMED"
  | "BEDWARS_FOUR_FOUR_SWAP"
  | "BEDWARS_FOUR_FOUR_VOIDLESS"
  | "BEDWARS_EIGHT_ONE_ULTIMATE"
  | "BEDWARS_EIGHT_TWO_ULTIMATE";


// ==========================
// Generic Game (fallback)
// ==========================
export interface PlayerCountGame {
  players: number;
  modes?: Record<string, number>;
}


// ==========================
// Bedwars (typed)
// ==========================
export interface BedwarsPlayerCountGame {
  players: number;
  modes: Partial<Record<BedwarsMode, number>>;
}


// ==========================
// Response
// ==========================
export interface PlayerCountResponse {
  success: boolean;
  playerCount: number;

  games: {
    BEDWARS: BedwarsPlayerCountGame;
  } & Record<string, PlayerCountGame>;
}
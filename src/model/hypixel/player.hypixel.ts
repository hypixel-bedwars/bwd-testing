import MinecraftColor from "../minecraftColor.model";

export interface BedwarsStats {
  Experience: number;
  wins_bedwars: number;
  final_kills_bedwars: number;
  beds_broken_bedwars: number;
}

export interface HypixelRankData {
  packageRank?: string;
  newPackageRank?: string;
  monthlyPackageRank?: string;
  rankPlusColor?: string;
  monthlyRankColor?: string;
  rank?: string | null;
  prefix?: string;
}

export interface HypixelPlayer extends HypixelRankData {
  uuid: string;
  displayname: string;

  stats: {
    Bedwars: BedwarsStats;
  };

  networkExp: number;

  // computed fields
  tag?: RankFormat;
  tagString?: string;
	stars?: number;
	formattedstars?: string;
}

export interface PlayerResponse {
  success: boolean;
  player: HypixelPlayer;
}

// Taken from robere2 from github
// https://gist.github.com/robere2/88af445d2285682fed9f5c001f30b186#file-hypixel-tag-calculator-js-L138
//
// honestly too lazy to make it myself
// "Don't reinvent the wheel, just realign it," coined by Anthony J. D'Angelo
// ^^^

// ================= TYPES =================

type Rank =
  | "ADMIN"
  | "MODERATOR"
  | "HELPER"
  | "JR_HELPER"
  | "YOUTUBER"
  | "SUPERSTAR"
  | "MVP_PLUS"
  | "MVP"
  | "VIP_PLUS"
  | "VIP"
  | "DEFAULT";

type RankComponent = [string, string];
type RankFormat = RankComponent[];

type RankMap = Record<Rank, RankFormat>;
type ColorMap = Record<string, string>;

// ================= DATA =================

const ranks: RankMap = {
  ADMIN: [["c", "[ADMIN]"]],
  MODERATOR: [["2", "[MOD]"]],
  HELPER: [["9", "[HELPER]"]],
  JR_HELPER: [["9", "[JR HELPER]"]],
  YOUTUBER: [
    ["c", "["],
    ["f", "YOUTUBE"],
    ["c", "]"],
  ],
  SUPERSTAR: [
    ["%r", "[MVP"],
    ["%p", "++"],
    ["%r", "]"],
  ],
  MVP_PLUS: [
    ["b", "[MVP"],
    ["%p", "+"],
    ["b", "]"],
  ],
  MVP: [["b", "[MVP]"]],
  VIP_PLUS: [
    ["a", "[VIP"],
    ["6", "+"],
    ["a", "]"],
  ],
  VIP: [["a", "[VIP]"]],
  DEFAULT: [["7", ""]],
};

const colors: ColorMap = {
  BLACK: "0",
  DARK_BLUE: "1",
  DARK_GREEN: "2",
  DARK_AQUA: "3",
  DARK_RED: "4",
  DARK_PURPLE: "5",
  GOLD: "6",
  GRAY: "7",
  DARK_GRAY: "8",
  BLUE: "9",
  GREEN: "a",
  AQUA: "b",
  RED: "c",
  LIGHT_PURPLE: "d",
  YELLOW: "e",
  WHITE: "f",
};

// ================= CONSTANTS =================

const defaultPlusColor = "c";
const defaultRankColor = "6";

// ================= FUNCTIONS =================

export function calcTag(player?: HypixelRankData): RankFormat {
  if (player && typeof player === "object") {
    let {
      packageRank,
      newPackageRank,
      monthlyPackageRank,
      rankPlusColor,
      monthlyRankColor,
      rank,
      prefix,
    } = player;

    if (rank === "NORMAL") rank = null;
    if (monthlyPackageRank === "NONE") monthlyPackageRank = undefined;
    if (packageRank === "NONE") packageRank = undefined;
    if (newPackageRank === "NONE") newPackageRank = undefined;

    if (prefix && typeof prefix === "string") {
      return parseMinecraftTag(prefix);
    }

    const selectedRank =
      (rank as Rank) ||
      (monthlyPackageRank as Rank) ||
      (newPackageRank as Rank) ||
      (packageRank as Rank);

    if (selectedRank && ranks[selectedRank]) {
      return replaceCustomColors(
        ranks[selectedRank],
        colors[rankPlusColor || ""],
        colors[monthlyRankColor || ""],
      );
    }
  }

  return replaceCustomColors(ranks.DEFAULT, null, null);
}

// ----------------------------

export function parseMinecraftTag(tag: string): RankFormat {
  const newRank: RankFormat = [];
  const splitTag = tag.split(/§([a-f0-9])/);
  splitTag.unshift("f");

  for (let i = 0; i < splitTag.length; i++) {
    const j = Math.floor(i / 2);
    const k = i % 2;

    if (!newRank[j]) newRank[j] = ["", ""];
    newRank[j][k] = splitTag[i];
  }

  return newRank;
}

// ----------------------------

export function replaceCustomColors(
  rank: RankFormat,
  p: string | null | undefined,
  r: string | null | undefined,
): RankFormat {
  const newRank = rank.map(([c, t]) => [c, t] as RankComponent);

  if (!p || p.length > 1) p = defaultPlusColor;
  if (!r || r.length > 1) r = defaultRankColor;

  newRank.forEach((component) => {
    if (component[0] === "%p") component[0] = p!;
    if (component[0] === "%r") component[0] = r!;
  });

  return newRank;
}

export function formatTag(tag: RankFormat): string {
  return tag.map(([c, t]) => `§${c}${t}`).join("");
}

export function attachTag(player: HypixelPlayer): HypixelPlayer {
  const tag = player.tag ?? calcTag(player);

  return {
    ...player,
    tag,
    tagString: formatTag(tag),
  };
}

export function attachStars(player: HypixelPlayer): HypixelPlayer {
  let xp = player.stats.Bedwars.Experience ?? 0;

  const thresholds = [
    500,
    1000,
    2000,
    3500,
    ...Array(95).fill(5000),
  ];

  let stars = 0;
  let i = 0;

  while (xp >= thresholds[i]) {
    xp -= thresholds[i];
    i = (i + 1) % thresholds.length;
    stars++;
  }

  return {
    ...player,
    stars: stars - 1, // Subtract 1 because the first star is at 0 XP, not 500 XP
  };
}

export function formatStars(player: HypixelPlayer) {
	const stars = player.stars ?? 0
	const prestige = Math.trunc(stars / 100)

	if (prestige == 0) {
		return {
			...player,
			formattedstars: `${MinecraftColor.GRAY}${stars}`
		}
	} else if (prestige == 1) {
		return {

		}
	}

	// Gotta do this idk fucking 50 more times
	// cant find a better way
}

export function attachAll(player: HypixelPlayer): HypixelPlayer {
  return attachStars(attachTag(player));
}

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
  player: HypixelPlayer | null;
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

  const thresholds = [500, 1000, 2000, 3500, ...Array(95).fill(5000)];

  let stars = 0;
  let i = 0;

  while (xp >= thresholds[i]) {
    xp -= thresholds[i];
    i = (i + 1) % thresholds.length;
    stars++;
  }
  
  const formatted_stars = formatStars({
    ...player,
    stars: stars - 1,
  });

  return {
    ...player,
    stars: Math.max(0, stars - 1), // Subtract 1 because the first star is at 0 XP, not 500 XP
    formattedstars: formatted_stars
  };
}

// All the prestiges below or 3000 were taken from some github
// All the prestiges above 3000 were taken from (https://github.com/SampleSpaceDev/PIP/blob/master/index.js) gotta lobe that guy
const prestigeFormats: Record<number, (level: number, d: string[]) => string> = {
  0: (level) => `${MinecraftColor.GRAY}[${level}✫]`,
  1: (level) => `${MinecraftColor.WHITE}[${level}✫]`,
  2: (level) => `${MinecraftColor.GOLD}[${level}✫]`,
  3: (level) => `${MinecraftColor.AQUA}[${level}✫]`,
  4: (level) => `${MinecraftColor.DARK_GREEN}[${level}✫]`,
  5: (level) => `${MinecraftColor.DARK_AQUA}[${level}✫]`,
  6: (level) => `${MinecraftColor.DARK_RED}[${level}✫]`,
  7: (level) => `${MinecraftColor.LIGHT_PURPLE}[${level}✫]`,
  8: (level) => `${MinecraftColor.BLUE}[${level}✫]`,
  9: (level) => `${MinecraftColor.DARK_PURPLE}[${level}✫]`,

  10: (_, d) => `${MinecraftColor.RED}[${MinecraftColor.GOLD}${d[0]}${MinecraftColor.YELLOW}${d[1]}${MinecraftColor.GREEN}${d[2]}${MinecraftColor.AQUA}${d[3]}${MinecraftColor.LIGHT_PURPLE}✫${MinecraftColor.DARK_PURPLE}]`,

  11: (level) => `${MinecraftColor.GRAY}[${MinecraftColor.WHITE}${level}${MinecraftColor.GRAY}✪]`,
  12: (level) => `${MinecraftColor.GRAY}[${MinecraftColor.YELLOW}${level}${MinecraftColor.GOLD}✪${MinecraftColor.GRAY}]`,
  13: (level) => `${MinecraftColor.GRAY}[${MinecraftColor.AQUA}${level}${MinecraftColor.DARK_AQUA}✪${MinecraftColor.GRAY}]`,
  14: (level) => `${MinecraftColor.GRAY}[${MinecraftColor.GREEN}${level}${MinecraftColor.DARK_GREEN}✪${MinecraftColor.GRAY}]`,
  15: (level) => `${MinecraftColor.GRAY}[${MinecraftColor.DARK_AQUA}${level}${MinecraftColor.BLUE}✪${MinecraftColor.GRAY}]`,
  16: (level) => `${MinecraftColor.GRAY}[${MinecraftColor.RED}${level}${MinecraftColor.DARK_RED}✪${MinecraftColor.GRAY}]`,
  17: (level) => `${MinecraftColor.GRAY}[${MinecraftColor.LIGHT_PURPLE}${level}${MinecraftColor.DARK_PURPLE}✪${MinecraftColor.GRAY}]`,
  18: (level) => `${MinecraftColor.GRAY}[${MinecraftColor.BLUE}${level}${MinecraftColor.DARK_BLUE}✪${MinecraftColor.GRAY}]`,
  19: (level) => `${MinecraftColor.GRAY}[${MinecraftColor.DARK_PURPLE}${level}${MinecraftColor.GRAY}✪${MinecraftColor.GRAY}]`,

  20: (_, d) => `${MinecraftColor.DARK_GRAY}[${MinecraftColor.GRAY}${d[0]}${MinecraftColor.WHITE}${d[1]}${d[2]}${MinecraftColor.GRAY}${d[3]}✪${MinecraftColor.DARK_GRAY}]`,

  21: (_, d) => `${MinecraftColor.WHITE}[${d[0]}${MinecraftColor.YELLOW}${d[1]}${d[2]}${MinecraftColor.GOLD}${d[3]}${MinecraftColor.BOLD}⚝${MinecraftColor.GOLD}]`,
  22: (_, d) => `${MinecraftColor.GOLD}[${d[0]}${MinecraftColor.WHITE}${d[1]}${d[2]}${MinecraftColor.AQUA}${d[3]}${MinecraftColor.BOLD}⚝${MinecraftColor.AQUA}]`,
  23: (_, d) => `${MinecraftColor.DARK_PURPLE}[${d[0]}${MinecraftColor.LIGHT_PURPLE}${d[1]}${d[2]}${MinecraftColor.GOLD}${d[3]}${MinecraftColor.YELLOW}${MinecraftColor.BOLD}⚝${MinecraftColor.YELLOW}]`,
  24: (_, d) => `${MinecraftColor.AQUA}[${d[0]}${MinecraftColor.WHITE}${d[1]}${d[2]}${MinecraftColor.GRAY}${d[3]}${MinecraftColor.BOLD}⚝${MinecraftColor.DARK_GRAY}]`,
  25: (_, d) => `${MinecraftColor.WHITE}[${d[0]}${MinecraftColor.GREEN}${d[1]}${d[2]}${MinecraftColor.DARK_GREEN}${d[3]}${MinecraftColor.BOLD}⚝${MinecraftColor.DARK_GREEN}]`,
  26: (_, d) => `${MinecraftColor.DARK_RED}[${d[0]}${MinecraftColor.RED}${d[1]}${d[2]}${MinecraftColor.LIGHT_PURPLE}${d[3]}${MinecraftColor.BOLD}⚝${MinecraftColor.DARK_PURPLE}]`,
  27: (_, d) => `${MinecraftColor.YELLOW}[${d[0]}${MinecraftColor.WHITE}${d[1]}${d[2]}${MinecraftColor.DARK_GRAY}${d[3]}${MinecraftColor.BOLD}⚝${MinecraftColor.DARK_GRAY}]`,
  28: (_, d) => `${MinecraftColor.GREEN}[${d[0]}${MinecraftColor.DARK_GREEN}${d[1]}${d[2]}${MinecraftColor.GOLD}${d[3]}${MinecraftColor.BOLD}⚝${MinecraftColor.YELLOW}]`,
  29: (_, d) => `${MinecraftColor.AQUA}[${d[0]}${MinecraftColor.DARK_AQUA}${d[1]}${d[2]}${MinecraftColor.BLUE}${d[3]}${MinecraftColor.BOLD}⚝${MinecraftColor.DARK_BLUE}]`,

  30: (_, d) => `${MinecraftColor.YELLOW}[${d[0]}${MinecraftColor.GOLD}${d[1]}${d[2]}${MinecraftColor.RED}${d[3]}${MinecraftColor.BOLD}⚝${MinecraftColor.DARK_RED}]`,
  
  31: (_, d) => `${MinecraftColor.BLUE}[${d[0]}${MinecraftColor.DARK_AQUA}${d[1]}${MinecraftColor.DARK_AQUA}${d[2]}${MinecraftColor.GOLD}${d[3]}${MinecraftColor.BOLD}✥${MinecraftColor.YELLOW}]`,
  32: (_, d) => `${MinecraftColor.RED}[${MinecraftColor.DARK_RED}${d[0]}${MinecraftColor.GRAY}${d[1]}${MinecraftColor.GRAY}${d[2]}${MinecraftColor.DARK_RED}${d[3]}${MinecraftColor.BOLD}✥${MinecraftColor.RED}]`,
  33: (_, d) => `${MinecraftColor.BLUE}[${MinecraftColor.BLUE}${d[0]}${MinecraftColor.BLUE}${d[1]}${MinecraftColor.LIGHT_PURPLE}${d[2]}${MinecraftColor.RED}${d[3]}${MinecraftColor.BOLD}✥${MinecraftColor.DARK_RED}]`,
  34: (_, d) => `${MinecraftColor.DARK_GREEN}[${MinecraftColor.GREEN}${d[0]}${MinecraftColor.LIGHT_PURPLE}${d[1]}${MinecraftColor.LIGHT_PURPLE}${d[2]}${MinecraftColor.DARK_PURPLE}${d[3]}${MinecraftColor.BOLD}✥${MinecraftColor.DARK_GREEN}]`,
  35: (_, d) => `${MinecraftColor.RED}[${MinecraftColor.RED}${d[0]}${MinecraftColor.DARK_RED}${d[1]}${MinecraftColor.DARK_RED}${d[2]}${MinecraftColor.DARK_GREEN}${d[3]}${MinecraftColor.BOLD}${MinecraftColor.GREEN}✥${MinecraftColor.GREEN}]`,
  36: (_, d) => `${MinecraftColor.GREEN}[${MinecraftColor.GREEN}${d[0]}${MinecraftColor.GREEN}${d[1]}${MinecraftColor.AQUA}${d[2]}${MinecraftColor.BLUE}${d[3]}${MinecraftColor.BOLD}✥${MinecraftColor.DARK_BLUE}]`,
  37: (_, d) => `${MinecraftColor.DARK_RED}[${MinecraftColor.DARK_RED}${d[0]}${MinecraftColor.RED}${d[1]}${MinecraftColor.RED}${d[2]}${MinecraftColor.AQUA}${d[3]}${MinecraftColor.BOLD}${MinecraftColor.DARK_AQUA}✥${MinecraftColor.DARK_AQUA}]`,
  38: (_, d) => `${MinecraftColor.DARK_BLUE}[${d[0]}${MinecraftColor.BLUE}${d[1]}${MinecraftColor.DARK_PURPLE}${d[2]}${d[3]}${MinecraftColor.BOLD}${MinecraftColor.LIGHT_PURPLE }✥${MinecraftColor.DARK_BLUE}]`,  
  39: (_, d) => `${MinecraftColor.RED}[${MinecraftColor.RED}${d[0]}${MinecraftColor.GREEN}${d[1]}${MinecraftColor.GREEN}${d[2]}${MinecraftColor.DARK_AQUA}${d[3]}${MinecraftColor.BOLD}${MinecraftColor.BLUE}✥${MinecraftColor.BLUE}]`,

  40: (_, d) => `${MinecraftColor.DARK_PURPLE}[${MinecraftColor.DARK_PURPLE}${d[0]}${MinecraftColor.RED}${d[1]}${MinecraftColor.RED}${d[2]}${MinecraftColor.GOLD}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.YELLOW}]`,
  
  41: (_, d) => `${MinecraftColor.YELLOW}[${MinecraftColor.YELLOW}${d[0]}${MinecraftColor.GOLD}${d[1]}${MinecraftColor.RED}${d[2]}${MinecraftColor.LIGHT_PURPLE}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.DARK_PURPLE}]`,
  42: (_, d) => `${MinecraftColor.DARK_BLUE}[${MinecraftColor.BLUE}${d[0]}${MinecraftColor.DARK_AQUA}${d[1]}${MinecraftColor.AQUA}${d[2]}${MinecraftColor.WHITE}${d[3]}${MinecraftColor.BOLD}${MinecraftColor.GRAY}✭]`,
  43: (_, d) => `${MinecraftColor.BLACK}[${MinecraftColor.DARK_PURPLE}${d[0]}${MinecraftColor.DARK_GRAY}${d[1]}${MinecraftColor.DARK_GRAY}${d[2]}${MinecraftColor.DARK_PURPLE}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.BLACK}]`,
  44: (_, d) => `${MinecraftColor.DARK_GREEN}[${MinecraftColor.DARK_GREEN}${d[0]}${MinecraftColor.GREEN}${d[1]}${MinecraftColor.YELLOW}${d[2]}${MinecraftColor.GOLD}${d[3]}${MinecraftColor.BOLD}${MinecraftColor.DARK_PURPLE}✭${MinecraftColor.LIGHT_PURPLE}]`,
  45: (_, d) => `${MinecraftColor.WHITE}[${MinecraftColor.WHITE}${d[0]}${MinecraftColor.AQUA}${d[1]}${MinecraftColor.AQUA}${d[2]}${MinecraftColor.DARK_AQUA}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.DARK_AQUA}]`,
  46: (_, d) => `${MinecraftColor.DARK_AQUA}[${MinecraftColor.AQUA}${d[0]}${MinecraftColor.YELLOW}${d[1]}${MinecraftColor.YELLOW}${d[2]}${MinecraftColor.GOLD}${d[3]}${MinecraftColor.BOLD}${MinecraftColor.LIGHT_PURPLE}✭${MinecraftColor.DARK_PURPLE}]`,
  47: (_, d) => `${MinecraftColor.WHITE}[${MinecraftColor.DARK_RED}${d[0]}${MinecraftColor.RED}${d[1]}${MinecraftColor.RED}${d[2]}${MinecraftColor.BLUE}${d[3]}${MinecraftColor.BOLD}${MinecraftColor.DARK_BLUE}✭${MinecraftColor.BLUE}]`,
  48: (_, d) => `${MinecraftColor.DARK_PURPLE}[${MinecraftColor.DARK_PURPLE}${d[0]}${MinecraftColor.RED}${d[1]}${MinecraftColor.GOLD}${d[2]}${MinecraftColor.YELLOW}${d[3]}${MinecraftColor.BOLD}${MinecraftColor .AQUA}✭${MinecraftColor.DARK_AQUA}]`,
  49: (_, d) => `${MinecraftColor.DARK_GREEN}[${MinecraftColor.GREEN}${d[0]}${MinecraftColor.WHITE}${d[1]}${MinecraftColor.WHITE}${d[2]}${MinecraftColor.GREEN}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.DARK_GREEN}]`,
  
  50: (_, d) => `${MinecraftColor.DARK_RED}[${MinecraftColor.DARK_RED}${d[0]}${MinecraftColor.DARK_PURPLE}${d[1]}${MinecraftColor.BLUE}${d[2]}${MinecraftColor.BLUE}${d[3]}${MinecraftColor.BOLD}${MinecraftColor.DARK_BLUE}✭${MinecraftColor.BLACK}]`,

  51: (_, d) => `${MinecraftColor.DARK_RED}[${MinecraftColor.RED}${d[0]}${MinecraftColor.GOLD}${d[1]}${MinecraftColor.YELLOW}${d[2]}${MinecraftColor.WHITE}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.DARK_RED}]`,
  52: (_, d) => `${MinecraftColor.DARK_BLUE}[${MinecraftColor.BLUE}${d[0]}${MinecraftColor.DARK_AQUA}${d[1]}${MinecraftColor.AQUA}${d[2]}${MinecraftColor.YELLOW}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.YELLOW}]`,
  53: (_, d) => `${MinecraftColor.DARK_PURPLE}[${MinecraftColor.LIGHT_PURPLE}${d[0]}${MinecraftColor.YELLOW}${d[1]}${MinecraftColor.WHITE}${d[2]}${MinecraftColor.LIGHT_PURPLE}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.DARK_PURPLE}]`,
  54: (_, d) => `${MinecraftColor.DARK_AQUA}[${MinecraftColor.GREEN}${d[0]}${MinecraftColor.DARK_GREEN}${d[1]}${MinecraftColor.DARK_GRAY}${d[2]}${MinecraftColor.GREEN}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.DARK_AQUA}]`,
  55: (_, d) => `${MinecraftColor.DARK_GREEN}[${MinecraftColor.GREEN}${d[0]}${MinecraftColor.YELLOW}${d[1]}${MinecraftColor.WHITE}${d[2]}${MinecraftColor.LIGHT_PURPLE}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.DARK_PURPLE}]`,
  56: (_, d) => `${MinecraftColor.DARK_RED}[${MinecraftColor.RED}${d[0]}${MinecraftColor.YELLOW}${d[1]}${MinecraftColor.WHITE}${d[2]}${MinecraftColor.RED}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.DARK_RED}]`,
  57: (_, d) => `${MinecraftColor.DARK_RED}[${MinecraftColor.GOLD}${d[0]}${MinecraftColor.DARK_GREEN}${d[1]}${MinecraftColor.DARK_AQUA}${d[2]}${MinecraftColor.DARK_PURPLE}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.DARK_GRAY}]`,
  58: (_, d) => `${MinecraftColor.DARK_PURPLE}[${MinecraftColor.BLUE}${d[0]}${MinecraftColor.YELLOW}${d[1]}${MinecraftColor.WHITE}${d[2]}${MinecraftColor.DARK_AQUA}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.BLUE}]`,
  59: (_, d) => `${MinecraftColor.GRAY}[${MinecraftColor.BLACK}${d[0]}${MinecraftColor.DARK_GRAY}${d[1]}${MinecraftColor.GRAY}${d[2]}${MinecraftColor.WHITE}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.GRAY}]`,

  60: (_, d) => `${MinecraftColor.RED}[${MinecraftColor.WHITE}${d[0]}${MinecraftColor.WHITE}${d[1]}${MinecraftColor.WHITE}${d[2]}${MinecraftColor.RED}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.WHITE}]`,

  61: (_, d) => `${MinecraftColor.GOLD}[${MinecraftColor.YELLOW}${d[0]}${MinecraftColor.WHITE}${d[1]}${MinecraftColor.WHITE}${d[2]}${MinecraftColor.AQUA}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.DARK_AQUA}]`,
  62: (_, d) => `${MinecraftColor.YELLOW}[${MinecraftColor.WHITE}${d[0]}${MinecraftColor.YELLOW}${d[1]}${MinecraftColor.GOLD}${d[2]}${MinecraftColor.GOLD}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.YELLOW}]`,
  63: (_, d) => `${MinecraftColor.GREEN}[${MinecraftColor.YELLOW}${d[0]}${MinecraftColor.YELLOW}${d[1]}${MinecraftColor.YELLOW}${d[2]}${MinecraftColor.GREEN}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.GREEN}]`,
  64: (_, d) => `${MinecraftColor.AQUA}[${MinecraftColor.RED}${d[0]}${MinecraftColor.RED}${d[1]}${MinecraftColor.RED}${d[2]}${MinecraftColor.GREEN}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.GREEN}]`,
  65: (_, d) => `${MinecraftColor.DARK_AQUA}[${MinecraftColor.GREEN}${d[0]}${MinecraftColor.WHITE}${d[1]}${MinecraftColor.WHITE}${d[2]}${MinecraftColor.GREEN}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.DARK_AQUA}]`,
  66: (_, d) => `${MinecraftColor.BLUE}[${MinecraftColor.LIGHT_PURPLE}${d[0]}${MinecraftColor.LIGHT_PURPLE}${d[1]}${MinecraftColor.LIGHT_PURPLE}${d[2]}${MinecraftColor.AQUA}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.BLUE}]`,
  67: (_, d) => `${MinecraftColor.DARK_PURPLE}[${MinecraftColor.LIGHT_PURPLE}${d[0]}${MinecraftColor.LIGHT_PURPLE}${d[1]}${MinecraftColor.LIGHT_PURPLE}${d[2]}${MinecraftColor.WHITE}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.DARK_PURPLE}]`,
  68: (_, d) => `${MinecraftColor.BLACK}[${MinecraftColor.GOLD}${d[0]}${MinecraftColor.YELLOW}${d[1]}${MinecraftColor.YELLOW}${d[2]}${MinecraftColor.WHITE}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.WHITE}]`,
  69: (_, d) => `${MinecraftColor.GREEN}[${MinecraftColor.DARK_GREEN}${d[0]}${MinecraftColor.DARK_GREEN}${d[1]}${MinecraftColor.DARK_GREEN}${d[2]}${MinecraftColor.DARK_GREEN}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.DARK_GRAY}]`,

  70: (_, d) => `${MinecraftColor.DARK_AQUA}[${MinecraftColor.AQUA}${d[0]}${MinecraftColor.AQUA}${d[1]}${MinecraftColor.AQUA}${d[2]}${MinecraftColor.WHITE}${d[3]}${MinecraftColor.BOLD}✭${MinecraftColor.DARK_AQUA}]`,
};

export function formatStars(player: HypixelPlayer) {
  const stars = player.stars ?? 0;
  const prestige = Math.trunc(stars / 100);
  const digits = stars.toString().padStart(4, "0").split("");

  const formatter = prestigeFormats[prestige] ?? prestigeFormats[50];

  return formatter(stars, digits);
}

export function attachAll(player: HypixelPlayer): HypixelPlayer {
  return attachStars(attachTag(player));
}

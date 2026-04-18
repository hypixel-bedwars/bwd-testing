import { logger } from "../logger";
import { generateFkillsLeaderboard, generateStarsLeaderboard, generateWinsLeaderboard } from "../font/lib";
import hypixelApi from "../hypixel/hypixelApi";
import { HypixelPlayer } from "../model/hypixel/player.hypixel";
import fs from "fs";
import path from "path";
import { LeaderboardKey, LeaderboardData } from "../model/leaderboardData.model"

const FILE_PATH = path.join(process.cwd(), "data", "leaderboards.json");

function _isPlayer(p: HypixelPlayer | undefined): p is HypixelPlayer {
  return p !== undefined;
}

export async function generateAllLeaderboards() {
  const CONCURRENT = 2;
  const DELAY = 1000;
  
  const leaderboards = await hypixelApi.getBedwarsLeaderboards();
  if (!leaderboards) {
    return null;
  }
  
  const star_leaders_uuid = leaderboards.find(
    (lb) => lb.path === "bedwars_level",
  )?.leaders;
  
  const wins_leaders_uuid = leaderboards.find(
    (lb) => lb.path === "wins_new",
  )?.leaders;
  
  const fkills_leaders_uuid = leaderboards.find(
    (lb) => lb.path === "final_kills_new",
  )?.leaders;
  
  const allUUIDs = [
    ...(star_leaders_uuid ?? []),
    ...(wins_leaders_uuid ?? []),
    ...(fkills_leaders_uuid ?? []),
  ];
  
  const uniqueUUIDs = [...new Set(allUUIDs)];
  logger.info(`Fetching ${uniqueUUIDs.length} players...`);
  const playerMap = new Map<string, HypixelPlayer>();
  const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
  
  for (let i = 0; i < uniqueUUIDs.length; i += CONCURRENT) {
    const batch = uniqueUUIDs.slice(i, i + CONCURRENT);
  
    await Promise.all(
      batch.map(async (uuid) => {
        const player = await hypixelApi.getPlayerData(uuid);
        if (player) playerMap.set(uuid, player);
      })
    );
  
    await sleep(DELAY);
  }
  
  const star_leaders = (star_leaders_uuid ?? [])
    .map(uuid => playerMap.get(uuid))
    .filter(_isPlayer);
  
  const wins_leaders = (wins_leaders_uuid ?? [])
    .map(uuid => playerMap.get(uuid))
    .filter(_isPlayer);
  
  const fkills_leaders = (fkills_leaders_uuid ?? [])
    .map(uuid => playerMap.get(uuid))
    .filter(_isPlayer);
  
  const star_leaderboard = await generateStarsLeaderboard(star_leaders);
  const wins_leaderboard = await generateWinsLeaderboard(wins_leaders);
  const fkills_leaderboard = await generateFkillsLeaderboard(fkills_leaders);

  return {
    star_leaderboard,
    wins_leaderboard,
    fkills_leaderboard,
  };
}

function readLeaderboardData(): LeaderboardData {
  try {
    if (!fs.existsSync(FILE_PATH)) return {};
    return JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));
  } catch {
    logger.info("Leaderboard data corrupted, resetting...");
    return {};
  }
}

function writeLeaderboardData(data: LeaderboardData) {
  const dir = path.dirname(FILE_PATH);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

export function saveLeaderboardMessageId(
  key: LeaderboardKey,
  channelId: string,
  messageId: string
) {
  const data = readLeaderboardData();

  data[key] = {
    channelId,
    messageId,
  };

  writeLeaderboardData(data);
}

export function getLeaderboardMessageId(key: LeaderboardKey) {
  const data = readLeaderboardData();
  return data[key];
}
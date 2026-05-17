import { logger } from "../logger";
import {
  generateFkillsLeaderboard,
  generateStarsLeaderboard,
  generateWinsLeaderboard,
} from "../font/lib";
import hypixelApi from "../hypixel/hypixelApi";
import { HypixelPlayer } from "../model/hypixel/player.hypixel";
import { LeaderboardKey, LeaderboardData } from "../model/leaderboardData.model";
import { readData, writeData } from "./dataReader";

const STORE_KEY = "leaderboards";

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

async function readLeaderboardData(): Promise<LeaderboardData> {
  const data = await readData<LeaderboardData>(STORE_KEY);
  return data ?? {};
}

async function writeLeaderboardData(data: LeaderboardData) {
  await writeData(STORE_KEY, data);
}

export async function saveLeaderboardMessageId(
  key: LeaderboardKey,
  channelId: string,
  messageId: string
) {
  const data = await readLeaderboardData();
  data[key] = { channelId, messageId };
  await writeLeaderboardData(data);
}

export async function getLeaderboardMessageId(key: LeaderboardKey) {
  const data = await readLeaderboardData();
  return data[key];
}

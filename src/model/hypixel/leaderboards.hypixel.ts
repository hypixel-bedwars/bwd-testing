export interface Leaderboard {
  path: string;
  prefix: string;
  title: string;
  location: string;
  count: number;
  leaders: string[];
}

export interface GameLeaderboards {
  [mode: string]: Leaderboard[];
}

export interface LeaderboardResponse {
  success: boolean;
  leaderboards: GameLeaderboards;
}

export type LeaderboardKey = "stars" | "wins" | "fkills";

export interface LeaderboardData {
  [key: string]: {
    channelId: string;
    messageId: string;
  };
}
export default interface AppConfig {
  // values that are needed globally
  // this is like a struct
  ClientId: string;
  GuildId: string;
  Token: string;
  DevId: string;

  HypixelToken: string;

  StarsLeaderboardChannelId: string;
  WinsLeaderboardChannelId: string;
  FkillsLeaderboardChannelId: string;
  DiscordLogChannelId: string;
}

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
  BedwarsStatusChannelId: string;
  DiscordLogChannelId: string;
  
  TicketsCategoryId: string;

  // Partner role selection menu
  PartnerUniversalRoleId: string;
}

import { Client } from "discord.js";
import { getConfig } from "./envloader";

export function getGuildGlassRoles(client: Client) {
  const guildId = getConfig().GuildId;
  const guild = client.guilds.cache.get(guildId);

  if (!guild) return [];

  let roles = guild.roles.cache
    .filter((role) => role.name.toLowerCase().includes("glass"))
    .map((role) => role);
  
  return roles;
}

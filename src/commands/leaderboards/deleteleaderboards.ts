import { ChatInputCommandInteraction, Client, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("deleteleaderboards")
    .setDescription("Delete all leaderboards")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (client: Client, interaction: ChatInputCommandInteraction) => {
    
  },
}

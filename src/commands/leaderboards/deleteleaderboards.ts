import { ChatInputCommandInteraction, Client, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { getLeaderboardMessageId } from "../../utils/leaderboards";

export default {
  data: new SlashCommandBuilder()
    .setName("deleteleaderboards")
    .setDescription("Delete all leaderboards")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (client: Client, interaction: ChatInputCommandInteraction) => {
    const stars_leaderboard_data = await getLeaderboardMessageId("stars")
    const wins_leaderboard_data = await getLeaderboardMessageId("wins")
    const fkills_leaderboard_data = await getLeaderboardMessageId("fkills")

    if (!stars_leaderboard_data && !wins_leaderboard_data && !fkills_leaderboard_data) {
      await interaction.editReply({ content: "No leaderboards tracked." })
      return;
    }
    
    const stars_leaderboard_channel = stars_leaderboard_data?.channelId
    const wins_leaderboard_channel = wins_leaderboard_data?.channelId
    const fkills_leaderboard_channel = fkills_leaderboard_data?.channelId
    
    const stars_leaderboard_messages = stars_leaderboard_data && stars_leaderboard_channel
      ? await client.channels.fetch(stars_leaderboard_channel)
          .then(c => (c && c.isTextBased() ? c.messages.fetch(stars_leaderboard_data.messageId) : null))
          .catch(() => null)
      : null;
    
    const wins_leaderboard_messages = wins_leaderboard_data && wins_leaderboard_channel
      ? await client.channels.fetch(wins_leaderboard_channel)
          .then(c => (c && c.isTextBased() ? c.messages.fetch(wins_leaderboard_data.messageId) : null))
          .catch(() => null)
      : null;
    
    const fkills_leaderboard_messages = fkills_leaderboard_data && fkills_leaderboard_channel
      ? await client.channels.fetch(fkills_leaderboard_channel)
          .then(c => (c && c.isTextBased() ? c.messages.fetch(fkills_leaderboard_data.messageId) : null))
          .catch(() => null)
      : null;
    
    if (stars_leaderboard_messages) await stars_leaderboard_messages.delete()
    if (wins_leaderboard_messages) await wins_leaderboard_messages.delete()
    if (fkills_leaderboard_messages) await fkills_leaderboard_messages.delete()
    
    await interaction.editReply({ content: "Leaderboards deleted" })
  },
}

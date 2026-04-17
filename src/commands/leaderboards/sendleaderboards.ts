import { ChannelType, ChatInputCommandInteraction, Client, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { generateAllLeaderboards } from "../../utils/leaderboards";
import { getConfig } from "../../utils/envloader";

export default {
  data: new SlashCommandBuilder()
    .setName("sendleaderboards")
    .setDescription("Send the leaderboards to the channel that are configured in .env")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(client: Client, interaction: ChatInputCommandInteraction) {
    if (
			!interaction.channel ||
			interaction.channel.type !== ChannelType.GuildText
		) {
			return await interaction.editReply({
				content: "This command can only be used in a server text channel.",
			});
    }
		
    const leaderboards = await generateAllLeaderboards()
    
    if (!leaderboards) {
      return await interaction.editReply({
        content: "Failed to generate leaderboards.",
      });
    }
    
    const stars_leaderboard = leaderboards.star_leaderboard;
    const wins_leaderboard = leaderboards.wins_leaderboard;
    const fkills_leaderboard = leaderboards.fkills_leaderboard;
    
    const star_leaderboard_channel_id = getConfig().StarsLeaderboardChannelId;
    const wins_leaderboard_channel_id = getConfig().WinsLeaderboardChannelId;
    const fkills_leaderboard_channel_id = getConfig().FkillsLeaderboardChannelId;
    
    const star_leaderboard_channel = await client.channels.fetch(star_leaderboard_channel_id);
    const wins_leaderboard_channel = await client.channels.fetch(wins_leaderboard_channel_id);
    const fkills_leaderboard_channel = await client.channels.fetch(fkills_leaderboard_channel_id);
    
    if (star_leaderboard_channel && star_leaderboard_channel.type == ChannelType.GuildText) {
      await star_leaderboard_channel.send({files: stars_leaderboard});
    }
    
    if (wins_leaderboard_channel && wins_leaderboard_channel.type == ChannelType.GuildText) {
      await wins_leaderboard_channel.send({files: wins_leaderboard});
    }
    
    if (fkills_leaderboard_channel && fkills_leaderboard_channel.type == ChannelType.GuildText) {
      await fkills_leaderboard_channel.send({files: fkills_leaderboard} );
    }
    
    await interaction.editReply({
      content: "Leaderboards sent successfully.",
    });
  },
}

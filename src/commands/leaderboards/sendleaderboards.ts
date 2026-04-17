import { ChannelType, ChatInputCommandInteraction, Client, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { generateAllLeaderboards, saveLeaderboardMessageId } from "../../utils/leaderboards";
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
    
    const star_files = stars_leaderboard.map((img, i) => ({
      attachment: img,
      name: `stars_leaderboard_image${i}.png`,
    }));
    
    const wins_files = wins_leaderboard.map((img, i) => ({
      attachment: img,
      name: `wins_leaderboard_image${i}.png`,
    }));
    
    const fkills_files = fkills_leaderboard.map((img, i) => ({
      attachment: img,
      name: `fkills_leaderboard_image${i}.png`,
    }));
    
    const stars_leaderboard_embeds = stars_leaderboard.map((_, i) => {
      return new EmbedBuilder()
        .setImage(`attachment://stars_leaderboard_image${i}.png`);
    });
    
    const wins_leaderboard_embeds = wins_leaderboard.map((_, i) => {
      return new EmbedBuilder()
        .setImage(`attachment://wins_leaderboard_image${i}.png`);
    });
    
    const fkills_leaderboard_embeds = fkills_leaderboard.map((_, i) => {
      return new EmbedBuilder()
        .setImage(`attachment://fkills_leaderboard_image${i}.png`);
    });
    
    const star_leaderboard_channel_id = getConfig().StarsLeaderboardChannelId;
    const wins_leaderboard_channel_id = getConfig().WinsLeaderboardChannelId;
    const fkills_leaderboard_channel_id = getConfig().FkillsLeaderboardChannelId;
    
    const star_leaderboard_channel = await client.channels.fetch(star_leaderboard_channel_id);
    const wins_leaderboard_channel = await client.channels.fetch(wins_leaderboard_channel_id);
    const fkills_leaderboard_channel = await client.channels.fetch(fkills_leaderboard_channel_id);
    
    if (star_leaderboard_channel && star_leaderboard_channel.type == ChannelType.GuildText) {
      const star_leaderboard_message = await star_leaderboard_channel.send({
        embeds: stars_leaderboard_embeds,
        files: star_files,
      });
    
      const star_leaderboard_msg_id = star_leaderboard_message.id;
      saveLeaderboardMessageId("stars", star_leaderboard_channel_id, star_leaderboard_msg_id)
    }
    
    if (wins_leaderboard_channel && wins_leaderboard_channel.type == ChannelType.GuildText) {
      const wins_leaderboard_message = await wins_leaderboard_channel.send({
        embeds: wins_leaderboard_embeds,
        files: wins_files,
      });
      
      const wins_leaderboard_msg_id = wins_leaderboard_message.id;
      saveLeaderboardMessageId("wins", wins_leaderboard_channel_id, wins_leaderboard_msg_id)
    }
    
    if (fkills_leaderboard_channel && fkills_leaderboard_channel.type == ChannelType.GuildText) {
      const fkills_leaderboard_message = await fkills_leaderboard_channel.send({
        embeds: fkills_leaderboard_embeds,
        files: fkills_files,
      });
      
      const fkills_leaderboard_msg_id = fkills_leaderboard_message.id;
      saveLeaderboardMessageId("fkills", fkills_leaderboard_channel_id, fkills_leaderboard_msg_id)
    }
    
    await interaction.editReply({
      content: "Leaderboards sent successfully.",
    });
  },
}

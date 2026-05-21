import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  Client,
  EmbedBuilder,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("listbots")
    .setDescription("This command will list all the discord bots"),

  async execute(client: Client, interaction: ChatInputCommandInteraction) {
    try {
      const members = await interaction.guild?.members.fetch();

      const bots = members?.filter((member) => member.user.bot);

      if (!bots || bots.size === 0) {
        return interaction.editReply({
          content: "No bots were found in this server.",
        });
      }

      if (!interaction.guild) return;

      const owner = await interaction.guild.fetchOwner();

      console.log(`Server owner: ${owner.user.tag} (${owner.id})`);

      const botList = bots
        .map(
          (bot, index) =>
            `**${index + 1}.** ${bot.user.tag} (\`${bot.user.id}\`)`,
        )
        .join("\n");

      const embed = new EmbedBuilder()
        .setTitle("🤖 Server Bots")
        .setDescription(botList)
        .setColor("Blurple")
        .setFooter({
          text: `Total Bots: ${bots.size}`,
        })
        .setTimestamp();

      await interaction.editReply({
        embeds: [embed],
      });
    } catch (error) {
      console.error(error);

      await interaction.editReply({
        content: "Failed to fetch bots.",
      });
    }
  },
};

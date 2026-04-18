import { logger } from "../../logger";
import {
  ChannelType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  MessageFlags,
  Client
} from "discord.js";
import { SlashCommandBuilder } from "discord.js";
import { getSubscriptionsEmbed } from "../../model/embeds/subscriptions.embed";

export default {
  data: new SlashCommandBuilder()
    .setName("subscriptionsembed")
    .setDescription("Sends the subscriptions embed")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(client: Client, interaction: ChatInputCommandInteraction) {
    if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
      return await interaction.editReply({
        content: "This command can only be used in a server text channel.",
      });
    }

    try {
      const container = getSubscriptionsEmbed();

      await interaction.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });

      await interaction.editReply({
        content: "✅ Subscriptions embed sent successfully.",
      });
    } catch (error) {
      logger.error({err: error});
      await interaction.editReply({
        content: "❌ Failed to send subscriptions embed.",
      });
    }
  },
};

import {
  ChannelType,
  ChatInputCommandInteraction,
  Client,
  PermissionFlagsBits,
  SlashCommandBuilder,
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} from "discord.js";

import { getConfig } from "../../utils/envloader";
import hypixelApi from "../../hypixel/hypixelApi";
import {
  readBedwarsStatusData,
  writeBedwarsStatusData,
  clearBedwarsStatusData,
} from "../../utils/bedwarsStatusData";
import { logger } from "../../logger";

async function buildStatusComponent() {
  const response = await hypixelApi.getBedwarsPlayerCount();
  const rotations = await hypixelApi.getBedwarsRotations();

  if (!response) return null;

  const timestamp = Math.floor(Date.now() / 1000);

  // Identifies a rotational mode that isn't one of the core 4 modes
  const dreamMode = rotations?.find(
    (m) =>
      ![
        "BEDWARS_EIGHT_ONE",
        "BEDWARS_EIGHT_TWO",
        "BEDWARS_FOUR_THREE",
        "BEDWARS_FOUR_FOUR",
      ].includes(m.mode),
  );

  const builder = new ContainerBuilder()
    .setAccentColor(0x2f3136)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent("# Bedwars Status"),
      new TextDisplayBuilder().setContent(
        `**Bedwars Players**\n${response.players.toLocaleString()}`,
      ),
      new TextDisplayBuilder().setContent(`**Updated**\n<t:${timestamp}:R>`),
      new TextDisplayBuilder().setContent(`\n*Updates every 30 minutes*`),
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(true),
    );

  if (dreamMode) {
    builder.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`### Current Dream Mode`),
      new TextDisplayBuilder().setContent(
        `**Mode**\n${dreamMode.name || dreamMode.mode}`,
      ),
      new TextDisplayBuilder().setContent(
        `**Players**\n${dreamMode.players.toLocaleString()}`,
      ),
    );
  }

  builder.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("• BWD"),
  );

  return builder;
}

export default {
  data: new SlashCommandBuilder()
    .setName("bedwarstatus")
    .setDescription("Manage the Bedwars status message")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) => sub.setName("send").setDescription("Send status"))
    .addSubcommand((sub) =>
      sub.setName("update").setDescription("Update status"),
    )
    .addSubcommand((sub) =>
      sub.setName("remove").setDescription("Remove status"),
    ),

  async execute(client: Client, interaction: ChatInputCommandInteraction) {
    if (
      !interaction.channel ||
      interaction.channel.type !== ChannelType.GuildText
    ) {
      return interaction.editReply({
        content: "Command restricted to text channels.",
      });
    }

    const sub = interaction.options.getSubcommand();
    const channelId = getConfig().BedwarsStatusChannelId;

    if (sub === "send") {
      const channel = await client.channels.fetch(channelId);
      if (!channel || channel.type !== ChannelType.GuildText) {
        return interaction.editReply({
          content: "Configuration error: Target channel invalid.",
        });
      }

      const component = await buildStatusComponent();
      if (!component) {
        logger.discord("Failed to retrieve Bedwars data for initial send.");
        return interaction.editReply({
          content: "API synchronization failed.",
        });
      }

      const message = await channel.send({
        components: [component],
        flags: MessageFlags.IsComponentsV2,
      });

      writeBedwarsStatusData({ channelId, messageId: message.id });
      return interaction.editReply({ content: "Status interface deployed." });
    }

    if (sub === "update") {
      const data = readBedwarsStatusData();
      if (!data)
        return interaction.editReply({ content: "No active status found." });

      const channel = await client.channels.fetch(data.channelId);
      if (!channel || channel.type !== ChannelType.GuildText)
        return interaction.editReply({ content: "Channel unreachable." });

      try {
        const message = await channel.messages.fetch(data.messageId);
        const component = await buildStatusComponent();

        if (!component) {
          logger.discord("Failed to fetch Bedwars data during update.");
          return interaction.editReply({ content: "Fetch failed." });
        }

        await message.edit({
          components: [component],
          flags: MessageFlags.IsComponentsV2,
        });

        return interaction.editReply({ content: "Interface synchronized." });
      } catch (err) {
        logger.error({ err }, "Message update failed");
        return interaction.editReply({ content: "Target message missing." });
      }
    }

    if (sub === "remove") {
      const data = readBedwarsStatusData();
      if (!data) return interaction.editReply({ content: "Nothing to clear." });

      const channel = await client.channels.fetch(data.channelId);
      if (channel && channel.type === ChannelType.GuildText) {
        try {
          const msg = await channel.messages.fetch(data.messageId);
          await msg.delete();
        } catch (err) {
          logger.error({ err }, "Failed to delete message during removal.");
        }
      }

      clearBedwarsStatusData();
      return interaction.editReply({ content: "Status interface removed." });
    }
  },
};

import {
  Client,
  ChannelType,
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} from "discord.js";
import { readBedwarsStatusData } from "../utils/bedwarsStatusData";
import hypixelApi from "../hypixel/hypixelApi";
import cron from "node-cron";
import { logger } from "../logger";

async function buildStatusComponent() {
  const response = await hypixelApi.getBedwarsPlayerCount();
  const rotations = await hypixelApi.getBedwarsRotations();

  if (!response) return null;

  const timestamp = Math.floor(Date.now() / 1000);

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

export async function updateBedwarsStatus(client: Client) {
  const data = await readBedwarsStatusData();
  if (!data) return;

  try {
    const channel = await client.channels.fetch(data.channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return;

    const message = await channel.messages.fetch(data.messageId);
    const component = await buildStatusComponent();

    if (!component) {
      logger.discord("Failed to fetch Bedwars data for cron update");
      return;
    }

    await message.edit({
      components: [component],
      flags: MessageFlags.IsComponentsV2,
    });

    logger.info("Bedwars status updated via cron");
  } catch (err) {
    logger.error({ err }, "Failed to update Bedwars status");
  }
}

export function startBedwarsStatusCron(client: Client) {
  const schedule = "*/30 * * * *";

  const task = cron.schedule(
    schedule,
    async () => {
      logger.info(`Bedwars status running (${schedule})`);
      try {
        await updateBedwarsStatus(client);
      } catch (err) {
        logger.error({ err }, "Failed to update bedwars status");
      }
    },
    { timezone: "UTC" },
  );

  return task;
}

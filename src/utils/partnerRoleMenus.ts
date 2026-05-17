import { ChannelType, Client, MessageFlags } from "discord.js";
import { logger } from "../logger";
import { getPartnerRolesEmbed } from "../model/embeds/partner-roles.embed";
import { readData, writeData } from "./dataReader";

export interface PartnerRoleMenuRef {
  channelId: string;
  messageId: string;
}

function storeKey(guildId: string) {
  return `partnerRoleMenus:${guildId}`;
}

export async function trackPartnerRoleMenuMessage(
  guildId: string,
  channelId: string,
  messageId: string,
) {
  const key = storeKey(guildId);
  const existing = (await readData<PartnerRoleMenuRef[]>(key)) || [];

  if (existing.some((r) => r.messageId === messageId)) return;

  existing.push({ channelId, messageId });
  await writeData(key, existing);
}

export async function refreshPartnerRoleMenus(client: Client, guildId: string) {
  const key = storeKey(guildId);
  const refs = (await readData<PartnerRoleMenuRef[]>(key)) || [];
  if (refs.length === 0) return;

  const components = [await getPartnerRolesEmbed()];

  const kept: PartnerRoleMenuRef[] = [];
  for (const ref of refs) {
    try {
      const channel = await client.channels.fetch(ref.channelId).catch(() => null);
      if (!channel) continue;

      // Only attempt edits in guild text channels.
      if (channel.type !== ChannelType.GuildText) continue;

      const msg = await (channel as any).messages.fetch(ref.messageId).catch(() => null);
      if (!msg) continue;

      await msg.edit({
        components,
        flags: MessageFlags.IsComponentsV2,
      });

      kept.push(ref);
    } catch (err) {
      logger.error({ err, ref }, "Failed to refresh partner role menu message");
      // Drop the ref so we don't keep failing forever.
    }
  }

  if (kept.length !== refs.length) {
    await writeData(key, kept);
  }
}

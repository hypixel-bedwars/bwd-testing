import {
  ActionRowBuilder,
  ContainerBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { readData } from "../../utils/dataReader";
import { PartnerRoles } from "../partner-roles.model";
import { getConfig } from "../../utils/envloader";

export async function getPartnerRolesEmbed(selectedRoleIds: string[] = []) {
  const partners = (await readData<PartnerRoles[]>("partners")) || [];
  const { PartnerUniversalRoleId } = getConfig();

  const selected = new Set(selectedRoleIds);

  const partnerSelect = new StringSelectMenuBuilder()
    .setCustomId("partner_role_select")
    .setPlaceholder("Select which partner pings you want...")
    .setMinValues(0);

  // Universal option always first.
  const universalOption = new StringSelectMenuOptionBuilder()
    .setLabel("All Partners")
    .setDescription("Pinged for all partner streams and videos")
    .setValue(PartnerUniversalRoleId)
    .setEmoji("🔔")
    .setDefault(selected.has(PartnerUniversalRoleId));

  const partnerOptions = partners
    .filter((p) => p.roleId !== PartnerUniversalRoleId)
    .map((partner) =>
      new StringSelectMenuOptionBuilder()
        .setLabel(partner.name)
        .setDescription(partner.description)
        .setValue(partner.roleId)
        .setEmoji(partner.emoji || "▶️")
        .setDefault(selected.has(partner.roleId)),
    );

  const options = [universalOption, ...partnerOptions].slice(0, 25);
  partnerSelect
    .setMaxValues(options.length) // Allow multiple selections
    .addOptions(options);

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    partnerSelect,
  );

  return new ContainerBuilder()
    .setAccentColor(0x2b2d31)
    .addTextDisplayComponents((text) =>
      text.setContent(
        `# Partner Roles\n` +
          `Choose which partner notifications you want.\n` +
          `• **All Partners** = pinged for all partner streams/videos\n` +
          `• Or pick individual partners instead`,
      ),
    )
    .addSeparatorComponents()
    .addActionRowComponents(row);
}

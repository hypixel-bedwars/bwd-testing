import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  Client,
  MessageFlags,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";
import { getPartnerRolesEmbed } from "../../model/embeds/partner-roles.embed";
import { readData } from "../../utils/dataReader";
import { PartnerRoles } from "../../model/partner-roles.model";
import { getConfig } from "../../utils/envloader";
import { trackPartnerRoleMenuMessage } from "../../utils/partnerRoleMenus";

export default {
  data: new SlashCommandBuilder()
    .setName("partnerroles")
    .setDescription("Post the partner role selection menu")
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

    const partners = (await readData<PartnerRoles[]>("partners")) || [];
    const { PartnerUniversalRoleId } = getConfig();

    // Validate config to avoid posting a broken menu.
    const universalRole = interaction.guild?.roles.cache.get(PartnerUniversalRoleId);
    if (!universalRole) {
      return await interaction.editReply({
        content:
          "❌ `PARTNER_UNIVERSAL_ROLE` is not a valid role ID in this server. Update `.env` and restart the bot.",
      });
    }
    const allowedRoleIds = new Set<string>([
      PartnerUniversalRoleId,
      ...partners.map((p) => p.roleId),
    ]);

    const message = await interaction.channel.send({
      components: [await getPartnerRolesEmbed()],
      flags: MessageFlags.IsComponentsV2,
    });

    await trackPartnerRoleMenuMessage(
      interaction.guildId!,
      interaction.channel.id,
      message.id,
    );
    await interaction.editReply({
      content: "✅ Partner role selection menu has been posted!",
    });
  },
};

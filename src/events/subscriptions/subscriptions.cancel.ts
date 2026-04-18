import { GuildMember, Client } from "discord.js";
import { ROLES } from "../../utils/rolemanager";
import { logger } from "../../logger";
import { getGuildGlassRoles } from "../../utils/subscriptions.utils";

// TODO: List all the native Discord subscription role IDs here
// this can only be done after the roles are created in the server
const NATIVE_SUB_ROLES = ["ID_FOR_TIER_1", "ID_FOR_TIER_2", "ID_FOR_TIER_3"];

const LOYALTY_ROLES = [
  ROLES.LOYAL_LEGEND_I,
  ROLES.LOYAL_LEGEND_II,
  ROLES.LOYAL_LEGEND_III,
];

export default {
  name: "subscriptions.cancel",
  async execute(
    client: Client,
    oldMember: GuildMember,
    newMember: GuildMember,
  ) {
    if (oldMember.roles.cache.size === newMember.roles.cache.size) return;

    const hadAnySubRole = NATIVE_SUB_ROLES.some((id) =>
      oldMember.roles.cache.has(id),
    );

    const hasAnySubRole = NATIVE_SUB_ROLES.some((id) =>
      newMember.roles.cache.has(id),
    );

    // Logic: If they HAD a sub role, but now have ZERO sub roles, they expired.
    if (hadAnySubRole && !hasAnySubRole) {
      const logMeta: any = {
        user: newMember.user.tag,
        userId: newMember.id,
        reason: "All Subscriptions Expired",
      };

      try {
        const loyaltyToRemove = LOYALTY_ROLES.filter((roleId) =>
          newMember.roles.cache.has(roleId),
        );

        const allGlassRoles = getGuildGlassRoles(client);
        const userGlassRoleIds = allGlassRoles
          ? allGlassRoles
              .filter((role) => newMember.roles.cache.has(role.id))
              .map((role) => role.id)
          : [];

        const totalRolesToRemove = [...loyaltyToRemove, ...userGlassRoleIds];

        if (totalRolesToRemove.length === 0) return;

        await newMember.roles.remove(totalRolesToRemove);

        await logger.discord(
          `📉 **Subscription Expired: Roles Removed**\n` +
            `👤 **User:** <@${newMember.id}>\n` +
            `🆔 **ID:** ${newMember.id}\n` +
            `🧹 **Removed:** ${loyaltyToRemove.length} Loyalty roles & ${userGlassRoleIds.length} Glass roles`,
          logMeta,
        );
      } catch (err: any) {
        logMeta.error = err.message || String(err);
        await logger.discord(
          `❌ **Cleanup Failed**\n👤 **User:** <@${newMember.id}>`,
          logMeta,
        );
      }
    }
  },
};

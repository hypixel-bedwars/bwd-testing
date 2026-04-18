import { Client, Message } from "discord.js";
import { logger } from "../../logger";
import { ROLES } from "../../utils/rolemanager";

export default {
  name: "subscriptions",
  async execute(client: Client, message: Message) {
    if (!message.roleSubscriptionData) return;

    const { tierName, totalMonthsSubscribed, isRenewal } = message.roleSubscriptionData;

    // Prepare metadata
    const logMeta: any = {
      user: message.author.tag,
      userId: message.author.id,
      tier: tierName,
      months: totalMonthsSubscribed,
      type: isRenewal ? "Renewal" : "New Subscription",
    };

    const baseInfo = `👤 **User:** <@${message.author.id}> (${message.author.id})\n🗓️ **Months:** ${totalMonthsSubscribed}`;

    let targetRoleId: string | null = null;
    if (totalMonthsSubscribed >= 6) targetRoleId = ROLES.LOYAL_LEGEND_III;
    else if (totalMonthsSubscribed >= 3) targetRoleId = ROLES.LOYAL_LEGEND_II;
    else if (totalMonthsSubscribed >= 1) targetRoleId = ROLES.LOYAL_LEGEND_I;

    if (!targetRoleId) {
      return logger.discord(`🎊 **Subscriber Renewed!** (No role change)\n${baseInfo}`, logMeta);
    }

    logMeta.roleId = targetRoleId;

    if (!message.member) {
      logMeta.error = "Member not found in guild cache";
      return logger.discord(`**Sub Alert: Member Missing**\n${baseInfo}`, logMeta);
    }

    const role = message.guild?.roles.cache.get(targetRoleId);
    if (!role) {
      logMeta.error = "Target role not found in server";
      return logger.discord(`**Sub Alert: Role Missing**\n${baseInfo}`, logMeta);
    }

    const me = message.guild?.members.me;
    if (!me?.permissions.has("ManageRoles")) {
      logMeta.error = "Bot is missing ManageRoles permission";
      return logger.discord(`**Sub Error: Permission Denied**\n${baseInfo}`, logMeta);
    }

    if (me.roles.highest.position <= role.position) {
      logMeta.error = "Hierarchy conflict";
      logMeta.botPos = me.roles.highest.position;
      logMeta.rolePos = role.position;
      return logger.discord(`**Sub Error: Hierarchy Blocked**\n${baseInfo}`, logMeta);
    }

    try {
      if (message.member.roles.cache.has(targetRoleId)) {
        return logger.discord(`🎊 **Subscriber Renewed!** (Role already owned)\n${baseInfo}`, logMeta);
      }

      await message.member.roles.add(targetRoleId);
      
      await logger.discord(`🎊 **Role Successfully Assigned!**\n${baseInfo}\n🏷️ **Role:** <@&${targetRoleId}>`, logMeta);

    } catch (err: any) {
      logMeta.error = err.message || String(err);
      await logger.discord(`**Sub Error: API Failure**\n${baseInfo}`, logMeta);
    }
  },
};
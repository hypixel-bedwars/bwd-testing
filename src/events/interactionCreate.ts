import {
	Client,
	Interaction,
	ChatInputCommandInteraction,
	MessageFlags,
	PermissionFlagsBits,
} from "discord.js";
import { getConfig } from "../utils/envloader";
import { getCategoryContent } from "../model/embeds/roles.embed";
import { logger } from "../logger";
import { readData } from "../utils/dataReader";
import { PartnerRoles } from "../model/partner-roles.model";

export default {
	name: "interactionCreate",
	async execute(client: Client, interaction: Interaction) {
		if (interaction.isStringSelectMenu()) {
			if (interaction.customId === "role_select_menu") {
				const selection = interaction.values[0];
				const container = getCategoryContent(selection, interaction);

				await interaction.reply({
					components: [container],
					flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
				});

				setTimeout(async () => {
					try {
						await interaction.deleteReply();
					} catch (e) { }
				}, 300_000);

				return;
			}

			if (interaction.customId === "partner_role_select") {
				if (!interaction.inGuild()) {
					await interaction.reply({
						content: "This menu can only be used in a server.",
						flags: MessageFlags.Ephemeral,
					});
					return;
				}

				try {
					await interaction.deferReply({ flags: MessageFlags.Ephemeral });
				} catch (err) {
					logger.error({ err }, "Failed to defer partner role select interaction");
					return;
				}

				const guild = interaction.guild;
				if (!guild) {
					await interaction.editReply({
						content: "This menu can only be used in a server.",
					});
					return;
				}

				const me = guild.members.me;
				if (!me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
					await interaction.editReply({
						content: "I can't update roles (missing Manage Roles permission).",
					});
					return;
				}

				const partners = (await readData<PartnerRoles[]>("partners")) || [];
				const { PartnerUniversalRoleId } = getConfig();
				const allowedRoleIds = new Set<string>([
					PartnerUniversalRoleId,
					...partners.map((p) => p.roleId),
				]);

				// If they somehow interacted with a disabled menu, just ignore.
				if (interaction.values.includes("none")) {
					await interaction.editReply({
						content: "There are no partner roles configured right now.",
					});
					return;
				}

				const selected = new Set(interaction.values);
				const member = interaction.member;
				if (!member) {
					await interaction.editReply({
						content: "Could not resolve your member record.",
					});
					return;
				}

				const guildMember = await guild.members.fetch(interaction.user.id);
				const rolesToAdd = Array.from(selected).filter((id) => allowedRoleIds.has(id));
				const rolesToRemove = Array.from(allowedRoleIds).filter(
					(id) => !selected.has(id) && guildMember.roles.cache.has(id),
				);

				if (rolesToAdd.length === 0 && rolesToRemove.length === 0) {
					await interaction.editReply({
						content: "✅ No changes needed.",
					});
					return;
				}

				const roleAboveBot = (roleId: string): boolean => {
					const role = guild.roles.cache.get(roleId);
					if (!role) return true;
					return me.roles.highest.position <= role.position;
				};

				if (
					(rolesToAdd.length > 0 && rolesToAdd.some(roleAboveBot)) ||
					(rolesToRemove.length > 0 && rolesToRemove.some(roleAboveBot))
				) {
					await interaction.editReply({
						content:
							"⚠️ I can't update one or more of these roles due to role hierarchy. Please contact staff.",
					});
					return;
				}

				const addableIds = rolesToAdd.filter((id) => !guildMember.roles.cache.has(id));
				const removableIds = rolesToRemove;

				try {
					if (addableIds.length > 0) await guildMember.roles.add(addableIds);
					if (removableIds.length > 0) await guildMember.roles.remove(removableIds);

					await interaction.editReply({
						content: "✅ Your partner notification roles have been updated.",
					});
				} catch (err) {
					logger.error({ err }, "Failed to update partner roles");
					await interaction.editReply({
						content: "❌ Failed to update your roles. Please try again later.",
					});
				}

				return;
			}
		}

		// handles the slash command interactions
		if (!interaction.isChatInputCommand()) return;

		try {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		} catch (err) {
      logger.error(
        {err: err},
				"Failed to defer interaction — likely a duplicate or expired token:",
			);
			return;
		}

		getConfig();

		// Permissioning is enforced via each command's `setDefaultMemberPermissions(...)`.
		// Keep DevId in config for convenience elsewhere.

		const commands = (client as any).commands;
		if (!commands) {
			logger.warn("No commands collection found on client.");
			await interaction.editReply("Internal error: no commands collection.");
			return;
		}

		const command = commands.get(interaction.commandName);
		if (!command) {
			logger.error(
				`No command matching ${interaction.commandName} was found.`,
			);
			await interaction.editReply(
				`Command not found: ${interaction.commandName}`,
			);
			return;
		}

		try {
			await command.execute(client, interaction as ChatInputCommandInteraction);
		} catch (error) {
      logger.error({err: error}, `Error executing ${interaction.commandName}:`);
			logger.discord(`⚠️ Command error in ${interaction.commandName}: ${error}`);
			try {
				await interaction.editReply(
					"There was an error while executing this command.",
				);
			} catch (err2) {
				logger.error({err: err2}, "Failed to send error reply to user:");
			}
		}
	},
};

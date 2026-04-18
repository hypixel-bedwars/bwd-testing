import {
	ContainerBuilder,
	SeparatorBuilder,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	RepliableInteraction,
	userMention,
} from "discord.js";
import { RULE_CATEGORIES } from "../menu.options";
import { ROLES } from "../../utils/rolemanager";

type CategoryHandler = (
	interaction: RepliableInteraction
) => ContainerBuilder;

const CATEGORY_HANDLERS: Record<string, CategoryHandler> = {
	discordstaff: getDiscordStaffCategory,
	hypixelstaff: getHypixelStaffCategory,
	prestiges: getPrestigeCategory,
	cosmetics: getCosmeticsCategory,
	events: getEventsCategory,
	legacy: getLegacyCategory,
};

function roleMention(roleId?: string): string {
	return roleId ? `<@&${roleId}>` : "@deleted-role";
}

function getFormattedTimestamp(): { date: string; time: string } {
	const timestamp = new Date();
	const timeString = timestamp.toLocaleTimeString("en-US", {
		hour12: true,
		timeZone: "UTC",
	});
	return {
		date: timestamp.toLocaleDateString(),
		time: timeString,
	};
}

function getRoleCount(interaction: RepliableInteraction): number {
	if (!interaction.inGuild()) return 0;
	return interaction.guild?.roles.cache.size || 0;
}

function getFooterContent(interaction: RepliableInteraction): string {
	const { date, time } = getFormattedTimestamp();
	const roleCount = getRoleCount(interaction);
	return `Updated ${date} ${time} UTC • Total Roles: ${roleCount}`;
}

export function getRoleInformationFirstPage(
	row: ActionRowBuilder<StringSelectMenuBuilder>,
	interaction: RepliableInteraction,
): ContainerBuilder {
	const { date, time } = getFormattedTimestamp();
	const roleCount = getRoleCount(interaction);

	return new ContainerBuilder()
		.setAccentColor(0x2b2d31)
		.addTextDisplayComponents((text) =>
			text.setContent(
				"# ROLE DIRECTORY\nSelect a category from the dropdown below to view roles and their descriptions.",
			),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		// .addTextDisplayComponents(
		//     (text) => text.setContent("**OFFICIAL**\n• Staff & Partnerships\n• Hypixel Ranks"),
		//     (text) => text.setContent("**PROGRESSION**\n• Bedwars Prestiges\n• Activity & Levels"),
		//     (text) => text.setContent("**COMMUNITY**\n• Cosmetics & Colors\n• Events & Giveaways"),
		//     (text) => text.setContent("**LEGACY**\n• Legacy Roles")
		// )
		// .addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents((text) =>
			text.setContent(
				`Updated ${date} ${time} UTC • Total Roles: ${roleCount}`,
			),
		)
		.addActionRowComponents(row);
}

export function getCategoryContent(
	selection: string,
	interaction: RepliableInteraction,
): ContainerBuilder {
	const normalized = (selection || "").toLowerCase();

	const category = RULE_CATEGORIES.find(
		(c) =>
			c.value.toLowerCase() === normalized ||
			c.label.toLowerCase() === normalized ||
			c.label.toLowerCase().replace(/\s+/g, "_") === normalized,
	) ?? null;

	if (!category) {
		return new ContainerBuilder()
			.setAccentColor(0x2b2d31)
			.addTextDisplayComponents((text) =>
				text.setContent(
					"# Unknown Category\nPlease select a valid category from the dropdown.",
				),
			);
	}

	const handler = CATEGORY_HANDLERS[category.value];

	if (!handler) {
		return new ContainerBuilder()
			.setAccentColor(0x2b2d31)
			.addTextDisplayComponents((text) =>
				text.setContent(`# ${category.label}\nNo content available yet.`),
			);
	}

	return handler(interaction);
}

function getDiscordStaffCategory(interaction: RepliableInteraction): ContainerBuilder {
	if (!interaction.inGuild()) {
		return new ContainerBuilder()
			.setAccentColor(0x2b2d31)
			.addTextDisplayComponents((text) =>
				text.setContent("# Staff\nThis category is only available in servers."),
			);
	}

	return new ContainerBuilder()
		.setAccentColor(0x2b2d31)
		.addTextDisplayComponents((text) =>
			text.setContent("# Discord Staff / Partnerships"),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(
			(text) =>
				text.setContent(
					"These roles are assigned to individuals who play a vital part in maintaining, managing, and supporting the server. Each role contributes to the smooth operation of the community, and without their collective efforts, the server would not function as it does today."
				),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(
			(text) =>
				text.setContent(
					"### **DISCORD STAFF ROLES**\n" +
					`• ${roleMention(ROLES.OWNER)} - okay/arham, the current Owner of the server\n` +
					`• ${roleMention(ROLES.MANAGEMENT)} - First in command of the Staff Team; responsible for overall staff operations and major decisions\n` +
					`• ${roleMention(ROLES.ADMIN)} - Managers of the Discord, overseeing moderators, enforcing policies, and handling escalated issues\n` +
					`• ${roleMention(ROLES.SENIOR_MODERATOR)} - Assist admins, particularly in staff management; a role reserved for experienced and trusted moderators\n` +
					`• ${roleMention(ROLES.MODERATOR)} - Responsible for moderating the server, enforcing rules, and assisting members\n` +
					`• ${roleMention(ROLES.TRIAL_MODERATOR)} - Moderators on a trial period (3–4 weeks) to assess performance and suitability for the role\n` +
					`• ${roleMention(ROLES.SUPPORT_TEAM)} - Individuals responsible for responding to and resolving support tickets. Reserved for Staff members only\n` +
					`• ${roleMention(ROLES.DEVELOPER)} - Individuals responsible for developing and maintaining the Discord bots used in the server\n` +
					`• ${roleMention(ROLES.GIVEAWAY_MANAGER)} - Organizes community-hosted giveaways. To host a giveaway, open a ticket in #help-and-support\n` +
					`• ${roleMention(ROLES.FORMER_STAFF)} - Individuals who were once staff in the discord`,
				),
			(text) =>
				text.setContent(
					"### **PARTNERSHIP ROLES**\n" +
					`• ${roleMention(ROLES.SPONSOR)} - Will be given to people that have given funding for our tournaments/events that were conducted or any other events within the Discord\n` +
					`• ${roleMention(ROLES.PARTNER)} - Content Creators that have joined hands with Hypixel Bedwars Discord to promote the server and their social media. \n` +
					`• ${roleMention(ROLES.SUPPORT_TEAM)} - Customer support`,
				),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents((text) =>
			text.setContent(getFooterContent(interaction)),
		);
}

function getHypixelStaffCategory(interaction: RepliableInteraction): ContainerBuilder {
	if (!interaction.inGuild()) {
		return new ContainerBuilder()
			.setAccentColor(0x2b2d31)
			.addTextDisplayComponents((text) =>
				text.setContent("# Hypixel Staff\nThis category is only available in servers."),
			);
	}

	return new ContainerBuilder()
		.setAccentColor(0x2b2d31)
		.addTextDisplayComponents((text) =>
			text.setContent("# Hypixel Staff & Ranks"),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(
			(text) =>
				text.setContent(
					"The following roles are **reserved exclusively** for users who hold the **corresponding official ranks on the Hypixel Network**"
				),)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(
			(text) =>
				text.setContent(
					"### **HYPIXEL STAFF ROLES**\n" +
						`• ${roleMention(ROLES.HYPIXEL_STAFF)} - Hypixel Staff\n` +
						`• ${roleMention(ROLES.HYPIXEL_YOUTUBER)} - Hypixel YouTuber`,
				),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents((text) =>
			text.setContent(getFooterContent(interaction)),
		);
}

function getPrestigeCategory(interaction: RepliableInteraction): ContainerBuilder {
	if (!interaction.inGuild()) {
		return new ContainerBuilder()
			.setAccentColor(0x2b2d31)
			.addTextDisplayComponents((text) =>
				text.setContent("# Prestiges\nThis category is only available in servers."),
			);
	}

	return new ContainerBuilder()
		.setAccentColor(0x2b2d31)
		.addTextDisplayComponents((text) =>
			text.setContent("# Prestiges & Progression"),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(
			(text) =>
				text.setContent(
					"**STANDARD RANKS**\n" +
					"• **Rookie** - Beginner rank\n" +
					"• **Apprentice** - Apprentice member\n" +
					"• **Noble** - Noble rank\n" +
					"• **Prodigy** - Prodigy member\n" +
					"• **Master** - Master rank\n" +
					"• **Sensei** - Master instructor",
				),
			(text) =>
				text.setContent(
					"**PRESTIGIOUS GEMS**\n" +
					"• **Stone** - Stone prestige\n" +
					"• **Iron** - Iron prestige\n" +
					"• **Gold** - Gold prestige\n" +
					"• **Diamond** - Diamond prestige\n" +
					"• **Emerald** - Emerald prestige\n" +
					"• **Sapphire** - Sapphire prestige",
				),
			(text) =>
				text.setContent(
					"**PRIME RANKS**\n" +
					"• **Iron Prime** - Iron prestige upgrade\n" +
					"• **Gold Prime** - Gold prestige upgrade\n" +
					"• **Diamond Prime** - Diamond prestige upgrade\n" +
					"• **Emerald Prime** - Emerald prestige upgrade\n" +
					"• **Sapphire Prime** - Sapphire prestige upgrade\n" +
					"• **Ruby Prime** - Ruby prestige upgrade",
				),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents((text) =>
			text.setContent(getFooterContent(interaction)),
		);
}

function getCosmeticsCategory(interaction: RepliableInteraction): ContainerBuilder {
	if (!interaction.inGuild()) {
		return new ContainerBuilder()
			.setAccentColor(0x2b2d31)
			.addTextDisplayComponents((text) =>
				text.setContent("# Cosmetics\nThis category is only available in servers."),
			);
	}

	return new ContainerBuilder()
		.setAccentColor(0x2b2d31)
		.addTextDisplayComponents((text) =>
			text.setContent("# Cosmetic"),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(
			(text) =>
				text.setContent(
					"These roles are purely cosmetic and are meant to personalize your appearance on the server. They mainly affect the **color of your username** in Discord, and in some cases display your **MEE6 level progression**. Cosmetic roles do **not** grant moderation powers, server authority, or special status beyond the perks explicitly listed below."
				)
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(
			(text) =>
				text.setContent(
					"### **WOOL COLORS**\n" +
					 `• ${roleMention(ROLES.RED_WOOL)}\n` +
					 `• ${roleMention(ROLES.YELLOW_WOOL)}\n` +
					 `• ${roleMention(ROLES.PINK_WOOL)}\n` +
					 `• ${roleMention(ROLES.MAGENTA_WOOL)}\n` +
					 `• ${roleMention(ROLES.PURPLE_WOOL)}\n` +
					 `• ${roleMention(ROLES.DARK_BLUE_WOOL)}\n` +
					 `• ${roleMention(ROLES.BLUE_WOOL)}\n` +
					 `• ${roleMention(ROLES.CYAN_WOOL)}\n` +
					 `• ${roleMention(ROLES.GREEN_WOOL)}\n` +
					 `• ${roleMention(ROLES.LIME_WOOL)}\n` +
					 `• ${roleMention(ROLES.ORANGE_WOOL)}\n` +
					 `• ${roleMention(ROLES.BROWN_WOOL)}\n` +
					 `• ${roleMention(ROLES.BLACK_WOOL)}\n` +
					 `• ${roleMention(ROLES.DARK_GREY_WOOL)}\n` +
					 `• ${roleMention(ROLES.GREY_WOOL)}\n` +
					 `• ${roleMention(ROLES.WHITE_WOOL)}\n` +
					 `• ${roleMention(ROLES.DJ)}\n`
				),
			(text) =>
				text.setContent(
					"### **MEE6's Leveling Roles**\n" +
						`• ${roleMention(ROLES.SENSEI)} - Level 100\n` +
						`• ${roleMention(ROLES.MASTER)} - Level 70\n` +
						`• ${roleMention(ROLES.PRODIGY)} - Level 50\n` +
						`• ${roleMention(ROLES.NOBLE)} - Level 20\n` +
						`• ${roleMention(ROLES.APPRENTICE)} - Level 10\n` +
						`• ${roleMention(ROLES.ROOKIE)} - Level 5`,
				),
			(text) =>
				text.setContent(
					"### **Nitro Boosting / Giveaways**\n" +
						`• ${roleMention(ROLES.NITRO_BOOSTER)} - Obainted by boosting the server, it allowes you to get 5x entries when entering giveaways\n` +
						`• ${roleMention(ROLES.GENEROUS)} - Gained when you contribute something to give away in a giveaway, the role gives you 2x extries when entering giveaways, and you can stram in voice chats\n` +
						`• ${roleMention(ROLES.GENEROUS_PLUS)} - Gained when you contribute $50+ worth of things to give away in giveaways Special role color, it has all the perks of ${roleMention(ROLES.GENEROUS)} and a special emoji displayed to the right of your username in chat\n` +
						`• ${roleMention(ROLES.GIVEAWAY_WINNER)} - Given to winner of any giveaway\n` +
						`• ${roleMention(ROLES.GIVEAWAYS)} - Used to notify interested people news about giveaways\n`,
				),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents((text) =>
			text.setContent(getFooterContent(interaction)),
		);
}

function getEventsCategory(interaction: RepliableInteraction): ContainerBuilder {
	if (!interaction.inGuild()) {
		return new ContainerBuilder()
			.setAccentColor(0x2b2d31)
			.addTextDisplayComponents((text) =>
				text.setContent("# Events\nThis category is only available in servers."),
			);
	}

	return new ContainerBuilder()
		.setAccentColor(0x2b2d31)
		.addTextDisplayComponents((text) =>
			text.setContent("# Events & Activities"),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(
			(text) =>
				text.setContent(
					"### **EVENT ROLES**\n" +
					`• ${roleMention(ROLES.EVENT_WINNER)} - Awarded to members who secure first place or win a server-hosted event\n` +
					`• ${roleMention(ROLES.QOTW)} - Members interested in participating in **Question Of The Week** can choose this role`
				),
			(text) =>
				text.setContent(
					"### **Activity-Based Roles**\n" +
					`• ${roleMention(ROLES.VC_ACTIVE)} - Earned by members who accumulate **3,500 voice chat minutes** within the past 30 days\n` +
					`• ${roleMention(ROLES.CHAT_ACTIVE)} - Earned by members who send **2,500 messages** within the past 30 days`,
				),
			(text) =>
				text.setContent(
					"### **Tournament Roles**\n" +
					`• ${roleMention(ROLES.TOURNAMENT_WINNER)} - Awarded to the member or team that wins an official server-hosted tournament\n` +
					`• ${roleMention(ROLES.TOURNAMENTS)} - A selectable role for members who are interested in participating in upcoming tournaments and competitive events`,
				),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents((text) =>
			text.setContent(getFooterContent(interaction)),
		);
}

function getLegacyCategory(interaction: RepliableInteraction): ContainerBuilder {
	if (!interaction.inGuild()) {
		return new ContainerBuilder()
			.setAccentColor(0x2b2d31)
			.addTextDisplayComponents((text) =>
				text.setContent("# Legacy\nThis category is only available in servers."),
			);
	}

	return new ContainerBuilder()
		.setAccentColor(0x2b2d31)
		.addTextDisplayComponents((text) =>
			text.setContent("# Legacy Roles"),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(
			(text) =>
				text.setContent(
					"Legacy roles are roles that were granted under **previous versions of the server’s role system**. These roles are no longer obtainable and are kept to recognize past contributions, achievements, or positions held at the time. Legacy roles are **purely historical** and do not grant additional permissions or advantages unless explicitly stated."
				),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(
			(text) =>
				text.setContent(
					`• ${roleMention(ROLES.FOUNDER)} - ${userMention("226464291799302145")}, The founder and former owner of the server\n` +
					`• Hypixel Player Council Role - Members of the Hypixel Player Council on the Hypixel Network\n` +
					`• MEE6 Level 90 role\n` +
					`• MEE6 Level 80 role\n` +
					`• MEE6 Level 60 role\n` +
					`• MEE6 Level 40 role\n` +
					`• MEE6 Level 30 role\n`,
				),
			(text) =>
				text.setContent(
					"### **The following were exclusive events that took place in 2020/2021**\n" +
					`• Halloween Event top users Role\n` +
					`• April Fools 2020 top users Role\n` +
					`• Thanksgiving 2020 top users Role\n` +
					`• Winter 2021 event top users Role\n`
				),
		)
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents((text) =>
			text.setContent(getFooterContent(interaction)),
		);
}

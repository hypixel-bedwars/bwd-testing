import {
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	ActionRowBuilder,
} from "discord.js";
import { RULE_CATEGORIES } from "../menu.options";

type DropdownOption = string | { label: string; value: string };

export function normalizeOptions(options: DropdownOption[]) {
	return options.map((opt) =>
		typeof opt === "string"
			? { label: opt, value: opt.toLowerCase().replace(/\s+/g, "_") }
			: { label: opt.label, value: opt.value },
	);
}


export function createDropdown(
	customId: string,
	placeholder: string,
	options: DropdownOption[],
) {
	const normalized = normalizeOptions(options);

	const menu = new StringSelectMenuBuilder()
		.setCustomId(customId)
		.setPlaceholder(placeholder)
		.addOptions(
			normalized.map((option) =>
				new StringSelectMenuOptionBuilder()
					.setLabel(option.label)
					.setValue(option.value),
			),
		);

	return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}


export function getCategoryContent(selection: string) {
	if (!selection) return null;

	const normalized = selection.toLowerCase();

	let found = RULE_CATEGORIES.find((c) => c.value.toLowerCase() === normalized);
	if (found) return found;

	found = RULE_CATEGORIES.find(
		(c) =>
			c.label.toLowerCase() === normalized ||
			c.label.toLowerCase().replace(/\s+/g, "_") === normalized,
	);
	if (found) return found;

	const loose = normalized.replace(/[_\s]+/g, "");
	found = RULE_CATEGORIES.find(
		(c) =>
			c.label.toLowerCase().replace(/\s+/g, "") === loose ||
			c.value.toLowerCase().replace(/[_\s]+/g, "") === loose,
	);
	return found || null;
}

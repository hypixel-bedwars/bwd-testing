import { EmbedBuilder } from "discord.js";

export default function getTemplateEmbed() {
	const embed = new EmbedBuilder()
		.setTitle("EMBED TITLE SECTION")
		.setURL("https://discord.js.org") 
		.setAuthor({
			name: "AUTHOR NAME SECTION",
			iconURL: "https://i.imgur.com/AfFp7pu.png",
			url: "https://discordjs.guide",
		})
		.setColor(0x2B2D31) 
		.setDescription(
			"DESCRIPTION SECTION\n" +
			"This area supports up to 4096 characters.\n\n" +
			"MARKDOWN TEST\n" +
			"Standard: **Bold**, *Italics*, __Underline__, ~~Strikethrough~~.\n" +
			"Code: `Inline Code` and blocks:\n" +
			"```\nPreformatted Code Block\n```\n" +
			"Links: [Masked Link Text](https://discord.js.org)\n" +
			"Mentions: <@1332344223176855592> and <#1234567890>"
		)
		.addFields(
			{ 
				name: "FIELD NAME 1 (INLINE)", 
				value: "Field values support 1024 characters.", 
				inline: true 
			},
			{ 
				name: "FIELD NAME 2 (INLINE)", 
				value: "Consecutive inline fields sit side-by-side.", 
				inline: true 
			},
			{ 
				name: "FIELD NAME 3 (INLINE)", 
				value: "Up to 3 fields fit in a single row.", 
				inline: true 
			},
			{ 
				name: "FIELD NAME 4 (NOT INLINE)", 
				value: "This field forces a new line because inline is false.", 
				inline: false 
			},
			{ 
				name: "\u200B", // Zero-width space
				value: "The field above this is a blank separator.", 
				inline: true 
			}
		)
		.setThumbnail("https://i.imgur.com/AfFp7pu.png") // Top right
		.setImage("https://i.imgur.com/yv9Z794.png") // Large bottom image
		.setTimestamp() // Displays at the bottom
		.setFooter({
			text: "FOOTER TEXT SECTION • LIMIT 2048 CHARACTERS",
			iconURL: "https://i.imgur.com/AfFp7pu.png",
		});

	return embed;
}
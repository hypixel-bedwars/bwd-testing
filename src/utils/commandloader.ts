import { logger } from "../logger";
import { REST, Routes, Client, Collection } from "discord.js";
import fs from "fs";
import path from "path";
import { getConfig } from "./envloader";

/**
 * Helper to recursively get all file paths from a directory
 */
function getFilesRecursive(dir: string): string[] {
	let results: string[] = [];
	const list = fs.readdirSync(dir);

	for (const file of list) {
		const fullPath = path.join(dir, file);
		const stat = fs.statSync(fullPath);

		if (stat && stat.isDirectory()) {
			results = results.concat(getFilesRecursive(fullPath));
		} else if (file.endsWith(".ts") || file.endsWith(".js")) {
			results.push(fullPath);
		}
	}
	return results;
}

function getRuntimeExtension(): ".ts" | ".js" {
	return __filename.endsWith(".ts") ? ".ts" : ".js";
}

export default async function commandLoader(
	commandPath: string,
	client: Client<boolean>,
) {
	const { Token, ClientId, GuildId } = getConfig();
	const runtimeExtension = getRuntimeExtension();

	if (!(client as any).commands) {
		(client as any).commands = new Collection<string, any>();
	}

	const commandFiles = getFilesRecursive(commandPath);
	const commandRegistry = new Map<string, any>();

	for (const filePath of commandFiles) {
		if (!filePath.endsWith(runtimeExtension)) continue;

		const imported = require(filePath);
		const command = imported.default ?? imported;

		if (command.data && command.execute) {
			const name = command.data.name ?? command.data.toJSON?.().name;

			if (name) {
				if (commandRegistry.has(name)) {
					logger.warn(
						`Duplicate command name \"${name}\" detected at ${filePath}; latest definition will be used.`,
					);
				}

				commandRegistry.set(name, command);
			} else {
				logger.warn(`Could not determine name for command at ${filePath}`);
			}
		} else {
			logger.warn(
				`The command at ${filePath} is missing "data" or "execute".`,
			);
		}
	}

	const rest = new REST({ version: "10" }).setToken(Token);
	(client as any).commands = new Collection(commandRegistry);
	const commandsToDeploy = Array.from(commandRegistry.values());

	try {
		logger.info(
			`Started refreshing ${commandsToDeploy.length} application (/) commands.`,
		);

		const data = await rest.put(
			Routes.applicationGuildCommands(ClientId, GuildId),
			{ body: commandsToDeploy.map((cmd) => cmd.data.toJSON()) },
		);

		logger.info(
			`Successfully reloaded ${Array.isArray(data) ? data.length : 0} commands.`,
		);
	} catch (error) {
		logger.error({err: error});
	}
}

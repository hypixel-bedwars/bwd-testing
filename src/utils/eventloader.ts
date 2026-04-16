import { Client } from "discord.js";
import fs from "fs";
import path from "path";

function getRuntimeExtension(): ".ts" | ".js" {
    return __filename.endsWith(".ts") ? ".ts" : ".js";
}

export default function eventLoader(
    dirPath: string, 
    client: Client<boolean>,
) {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    const runtimeExtension = getRuntimeExtension();
    const loadedEvents = ((client as any)._loadedEventNames ??= new Set<string>());

    for (const file of files) {
        const fullPath = path.join(dirPath, file.name);

        if (file.isDirectory()) {
            eventLoader(fullPath, client);
            continue;
        }

        if (!file.name.endsWith(runtimeExtension)) continue;

        const imported = require(fullPath);
        const event = imported.default ?? imported;

        if (!event.name || !event.execute) {
            console.warn(`The event at ${file.name} is missing "name" or "execute".`);
            continue;
        }

        if (loadedEvents.has(event.name)) {
            console.warn(`Skipping duplicate event registration for ${event.name} from ${file.name}.`);
            continue;
        }

        if (event.once) {
            client.once(event.name, (...args: any[]) => event.execute(client, ...args));
        } else {
            client.on(event.name, (...args: any[]) => event.execute(client, ...args));
        }

        loadedEvents.add(event.name);

        console.log(`Loaded event: ${event.name} from ${file.name}`);
    }
}
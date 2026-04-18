import { Client, Role } from "discord.js";
import { initRoles } from "../../utils/rolemanager";
import { logger } from "../../logger";

export default {
    name: "roleCreate",
    async execute(client: Client, role: Role) {
        logger.info(`Role Created: ${role.name}. Refreshing cache...`);
        
        await initRoles(client);
    },
};
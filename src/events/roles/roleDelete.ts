import { Client, Role } from "discord.js";
import { initRoles } from "../../utils/rolemanager";
import { logger } from "../../logger";

export default {
    name: "roleDelete",
    async execute(client: Client, role: Role) {
        logger.info(`Role Deleted: ${role.name}. Refreshing cache...`);
          
        // Refresh the variable so the deleted role ID is removed
        await initRoles(client);
    },
};
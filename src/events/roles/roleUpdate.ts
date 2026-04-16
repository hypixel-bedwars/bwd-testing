import { Client, Role } from "discord.js";
import { initRoles } from "../../utils/rolemanager";

export default {
    name: "roleUpdate",
    async execute(client: Client, oldRole: Role, newRole: Role) {
        if (oldRole.name !== newRole.name) {
            await initRoles(client);
        }
    },
};
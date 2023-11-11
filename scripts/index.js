console.warn(`§l[Ban system] §aReloaded!§r`)
import { world } from "@minecraft/server";
import { Command } from "./Main/commandHandler.js";
import { JsonDatabase } from "./Main/database.js";
import { ban, unban } from "./Main/functions";

export const banDB = new JsonDatabase("BanDB").load()


const banCMD = new Command({ name: "ban" })
Command.register(banCMD);

banCMD.addArgument("offlinePlayer").chainArgument("string").chainArgument("all", true, (player, [target, time, reason]) => {
    if (!/\d[ywdhms]/.test(time)) return player.sendMessage(`Not an allowable time!`);
    ban(player, `${target}`, time, reason ?? undefined)
});



const unBanCMD = new Command({ name: "unban" })
Command.register(unBanCMD);

unBanCMD.addArgument("offlinePlayer").chainArgument("all", true, (player, [target, reason]) => {
    unban(player, `${target}`, reason ?? undefined)
});
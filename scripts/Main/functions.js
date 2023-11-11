import { world } from "@minecraft/server";
import { banDB } from "../index.js"

function parseDuration(duration) {
    const timeRegex = /(\d+)(y|w|d|h|m|s)/g;
    let totalMilliseconds = 0;
    let match;
    while ((match = timeRegex.exec(duration)) !== null) {
        const value = parseInt(match[1]);
        const unit = match[2];
        if (unit === "y") {
            totalMilliseconds += value * 365 * 24 * 60 * 60 * 1000;
        } else if (unit === "w") {
            totalMilliseconds += value * 7 * 24 * 60 * 60 * 1000;
        } else if (unit === "d") {
            totalMilliseconds += value * 24 * 60 * 60 * 1000;
        } else if (unit === "h") {
            totalMilliseconds += value * 60 * 60 * 1000;
        } else if (unit === "m") {
            totalMilliseconds += value * 60 * 1000;
        } else if (unit === "s") {
            totalMilliseconds += value * 1000;
        }
    }
    return totalMilliseconds;
}


function calculateBanDuration(duration) {
    const millisecondsPerSecond = 1000;
    const millisecondsPerMinute = 60 * millisecondsPerSecond;
    const millisecondsPerHour = 60 * millisecondsPerMinute;
    const millisecondsPerDay = 24 * millisecondsPerHour;
    const millisecondsPerWeek = 7 * millisecondsPerDay;
    const millisecondsPerYear = 365 * millisecondsPerDay;

    const years = Math.floor(duration / millisecondsPerYear);
    duration %= millisecondsPerYear;
    const weeks = Math.floor(duration / millisecondsPerWeek);
    duration %= millisecondsPerWeek;
    const days = Math.floor(duration / millisecondsPerDay);
    duration %= millisecondsPerDay;
    const hours = Math.floor(duration / millisecondsPerHour);
    duration %= millisecondsPerHour;
    const minutes = Math.floor(duration / millisecondsPerMinute);
    duration %= millisecondsPerMinute;
    const seconds = Math.floor(duration / millisecondsPerSecond);

    let durationString = "";
    if (years > 0) {
        durationString += `${years} year${years > 1 ? "s" : ""} `;
    }
    if (weeks > 0) {
        durationString += `${weeks} week${weeks > 1 ? "s" : ""} `;
    }
    if (days > 0) {
        durationString += `${days} day${days > 1 ? "s" : ""} `;
    }
    if (hours > 0) {
        durationString += `${hours} hour${hours > 1 ? "s" : ""} `;
    }
    if (minutes > 0) {
        durationString += `${minutes} minute${minutes > 1 ? "s" : ""} `;
    }
    if (seconds > 0) {
        durationString += `${seconds} second${seconds > 1 ? "s" : ""} `;
    }

    return durationString.trim();
}


world.afterEvents.playerSpawn.subscribe((data) => {
    const player = data.player
    if (banDB.get(player.name)) {
        if (banDB.get(player.name).time > Date.now()) {
            player.runCommandAsync(`kick @s §r\nYou are banned by §g${banDB.get(player.name).by}§r\nReason: §g${banDB.get(player.name).reason}§r\nUnban from §g${calculateBanDuration(banDB.get(player.name).time - Date.now())}`)
        } else {
            banDB.delete(player.name)
        }
    }
})



export function unban(player, target, reason = "Without a reason") {
    if (banDB.get(target)) {
        banDB.delete(target)
        world.sendMessage(`Player §g${player.name}§r unbanned §g${target}§r. Reason: §g${reason}`)
    } else {
        player.sendMessage(`§g${target}§r is not banned!`)
    }
}


export function ban(player, target, time, reason = "Without a reason") {
    world.sendMessage(`Player §g${player.name}§r banned §g${target}§r for §g${calculateBanDuration(parseDuration(time))}§r. Reason: §g${reason}`)
    player.runCommandAsync(`kick "${target}" §r\nYou are banned by ${player.name}§r\nReason: §g${reason}§r\nUnban from: §g${calculateBanDuration(parseDuration(time))}`)
    const banSave = {
        time: Date.now() + parseDuration(time),
        reason: `${reason}`,
        by: `${player.name}`
    }
    banDB.set(`${target}`, banSave)

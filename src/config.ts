import { join } from "path";
import { type Config } from "./types";
import { readFile, writeFile } from "./utils";

const defaultConfig: Config = {
    cameraPollingInterval: 2,
    notifications: {
        motion: {
            toast: true,
            sound: true,
        },
        ring: {
            toast: true,
            sound: true,
        },
    }
};

const parseConfig = (config: Config): Config => {
    return {
        cameraPollingInterval: typeof config.cameraPollingInterval === "number"
            ? config.cameraPollingInterval
            : defaultConfig.cameraPollingInterval,
        notifications: {
            motion: {
                toast: typeof config.notifications.motion.toast === "boolean"
                    ? config.notifications.motion.toast
                    : defaultConfig.notifications.motion.toast,
                sound: typeof config.notifications.motion.sound === "boolean"
                    ? config.notifications.motion.sound
                    : defaultConfig.notifications.motion.sound
            },
            ring: {
                toast: typeof config.notifications.ring.toast === "boolean"
                    ? config.notifications.ring.toast
                    : defaultConfig.notifications.ring.toast,
                sound: typeof config.notifications.ring.sound === "boolean"
                    ? config.notifications.ring.sound
                    : defaultConfig.notifications.ring.sound
            },
        },
    };
};

const configPath = join(`${process.env.APPDATA}`, "Ring", "config.json");

let config: Config = defaultConfig;

const json = readFile(configPath);
if (json) {
    const parsedConfig = JSON.parse(json) as Config;
    config = parseConfig(parsedConfig);
}
else {
    writeFile(configPath, JSON.stringify(config, null, 4));
}

export default config;

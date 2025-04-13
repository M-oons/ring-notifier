import { join } from "path";
import { type Config } from "./types";
import { APP_PATH, readFile, writeFile } from "./utils";

const configPath = join(APP_PATH, "config.json");

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

let config: Config = defaultConfig;

export const getConfig = (): Config => {
    return config;
};

export const updateConfig = (updated: Partial<Config>): void => {
    config = {
        ...config,
        ...updated,
    };
    writeConfig(config);
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

const writeConfig = (config: Config): void => {
    writeFile(configPath, JSON.stringify(config, null, 4));
};

const json = readFile(configPath);
if (json) {
    const parsedConfig = JSON.parse(json) as Config;
    config = parseConfig(parsedConfig);
}
else {
    writeConfig(config);
}

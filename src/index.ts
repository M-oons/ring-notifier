import { app, Menu, Tray } from "electron";

if (require("electron-squirrel-startup"))
    app.quit();

import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import { APP_PATH, ASSETS_PATH, log, openExplorer } from "./utils";

if (!existsSync(APP_PATH))
    mkdirSync(APP_PATH, { recursive: true });

import { RingApi } from "ring-client-api";
import { readRefreshToken } from "./auth";
import { getConfig, updateConfig } from "./config";
import { handleNotification, handleRefreshTokenUpdate } from "./handlers";

let tray: Tray | null = null;

app.on("ready", async () => {
    tray = new Tray(join(ASSETS_PATH, "icon.png"));

    const menu = Menu.buildFromTemplate([
        {
            label: "Ring Notifier",
            type: "normal",
            enabled: false,
        },
        { type: "separator" },
        {
            label: "Open captures folder",
            type: "normal",
            click: () => {
                openExplorer(join(APP_PATH, "captures"));
            },
        },
        { type: "separator" },
        {
            label: "Notifications",
            type: "submenu",
            submenu: [
                {
                    label: "Motion",
                    type: "submenu",
                    submenu: [
                        {
                            label: "Show notifications",
                            type: "checkbox",
                            checked: getConfig().notifications.motion.toast,
                            click: (item) => {
                                const config = getConfig();
                                updateConfig({
                                    notifications: {
                                        motion: {
                                            toast: item.checked,
                                            sound: config.notifications.motion.sound,
                                        },
                                        ring: {
                                            toast: config.notifications.ring.toast,
                                            sound: config.notifications.ring.sound,
                                        },
                                    },
                                });
                            },
                        },
                        {
                            label: "Play sounds",
                            type: "checkbox",
                            checked: getConfig().notifications.motion.sound,
                            click: (item) => {
                                const config = getConfig();
                                updateConfig({
                                    notifications: {
                                        motion: {
                                            toast: config.notifications.motion.toast,
                                            sound: item.checked,
                                        },
                                        ring: {
                                            toast: config.notifications.ring.toast,
                                            sound: config.notifications.ring.sound,
                                        },
                                    },
                                });
                            },
                        },
                    ],
                },
                {
                    label: "Ring",
                    type: "submenu",
                    submenu: [
                        {
                            label: "Show notifications",
                            type: "checkbox",
                            checked: getConfig().notifications.ring.toast,
                            click: (item) => {
                                const config = getConfig();
                                updateConfig({
                                    notifications: {
                                        motion: {
                                            toast: config.notifications.motion.toast,
                                            sound: config.notifications.motion.sound,
                                        },
                                        ring: {
                                            toast: item.checked,
                                            sound: config.notifications.ring.sound,
                                        },
                                    },
                                });
                            },
                        },
                        {
                            label: "Play sounds",
                            type: "checkbox",
                            checked: getConfig().notifications.ring.sound,
                            click: (item) => {
                                const config = getConfig();
                                updateConfig({
                                    notifications: {
                                        motion: {
                                            toast: config.notifications.motion.toast,
                                            sound: config.notifications.motion.sound,
                                        },
                                        ring: {
                                            toast: config.notifications.ring.toast,
                                            sound: item.checked,
                                        },
                                    },
                                });
                            },
                        },
                    ],
                }
            ],
        },
        { type: "separator" },
        {
            label: "Quit",
            type: "normal",
            click: () => {
                app.quit();
            },
        },
    ]);
    tray.setContextMenu(menu);
    tray.setToolTip("Ring Notifier");

    await run();
});

const run = async () => {
    const ring = new RingApi({
        refreshToken: readRefreshToken(),
        cameraStatusPollingSeconds: getConfig().cameraPollingInterval,
    });

    ring.onRefreshTokenUpdated.subscribe(handleRefreshTokenUpdate);

    const locations = await ring.getLocations();
    const allCameras = await ring.getCameras();

    log(`Found ${locations.length} location(s) with ${allCameras.length} camera(s).`);

    for (const location of locations) {
        const cameras = location.cameras;
        const camerasList = cameras.map(camera => `\t- ${camera.id}: '${camera.name}' (${camera.deviceType})`).join("\n");

        log(`Location '${location.name}' has the following camera(s):\n${camerasList}`);

        for (const camera of cameras) {
            camera.onNewNotification.subscribe(ding => handleNotification(camera, ding));
        }
    }
};

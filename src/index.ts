import { join } from "path";
import { existsSync, mkdirSync, readFileSync } from "fs";

const appPath = join(`${process.env.APPDATA}`, "Ring");
if (!existsSync(appPath))
    mkdirSync(appPath, { recursive: true });

import { RingApi } from "ring-client-api";
import SysTray from "systray";
import { readRefreshToken } from "./auth";
import config from "./config";
import { handleNotification, handleRefreshTokenUpdate } from "./handlers";
import { log, openExplorer } from "./utils";

const tray = new SysTray({
    menu: {
        icon: readFileSync(join(__dirname, "assets", "icon.ico")).toString("base64"),
        title: "Ring Notifier",
        tooltip: "Ring Notifier",
        items: [
            {
                title: "Ring Notifier",
                tooltip: "Ring Notifier",
                enabled: false,
                checked: false,
            },
            {
                title: "Open captures folder",
                tooltip: "Open captures folder",
                enabled: true,
                checked: false,
            },
            {
                title: "Quit",
                tooltip: "Quit",
                enabled: true,
                checked: false,
            }
        ],
    },
});

tray.onClick(action => {
    switch (action.seq_id) {
        case 1: // open captures folder
            openExplorer(join(`${process.env.APPDATA}`, "Ring", "captures"));
            return;

        case 2: // quit
            tray.kill();
            return;
    }
});

tray.onReady(async () => {
    const ring = new RingApi({
        refreshToken: readRefreshToken(),
        cameraStatusPollingSeconds: config.cameraPollingInterval,
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
});

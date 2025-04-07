import { join } from "path";
import { existsSync, mkdirSync } from "fs";

const appPath = join(`${process.env.APPDATA}`, "Ring");
if (!existsSync(appPath))
    mkdirSync(appPath, { recursive: true });

import { RingApi } from "ring-client-api";
import { readRefreshToken } from "./auth";
import config from "./config";
import { handleNotification, handleRefreshTokenUpdate } from "./handlers";
import { log } from "./utils";

(async () => {
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
})();

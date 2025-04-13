import { exec } from "child_process";
import { join } from "path";
import { WindowsToaster } from "node-notifier";
import { type RingCamera } from "ring-client-api";
import { getConfig } from "./config";
import { type CameraEvent } from "./types";
import { ASSETS_PATH, openExplorer } from "./utils";

const toaster = new WindowsToaster();

export const notify = (camera: RingCamera, cameraEvent: CameraEvent, snapshotPath: string | null): void => {
    switch (cameraEvent) {
        case "motion":
            if (getConfig().notifications.motion.toast)
                showNotification("👀 Motion detected", `Motion detected at "${camera.name}"`, snapshotPath);
            if (getConfig().notifications.motion.sound)
                playSound(join(ASSETS_PATH, "motion.wav"));
            return;

        case "ring":
            if (getConfig().notifications.ring.toast)
                showNotification("🔔 Doorbell ring", `Doorbell ring at "${camera.name}"`, snapshotPath);
            if (getConfig().notifications.ring.sound)
                playSound(join(ASSETS_PATH, "ring.wav"));
            return;
    }
};

const showNotification = (title: string, message: string, snapshotPath: string | null): void => {
    toaster.notify({
        appID: "Ring",
        title,
        message,
        icon: snapshotPath || join(ASSETS_PATH, "logo.png"),
        sound: false,
    }, (_, response) => {
        if (response === undefined && snapshotPath) // clicked
            openExplorer(snapshotPath, true);
    });
};

const playSound = (soundPath: string): void => {
    const powershellCommand = `[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms') | Out-Null; $sound = New-Object System.Media.SoundPlayer; $sound.SoundLocation = '${soundPath}'; $sound.PlaySync();`;
    exec(`powershell -Command "${powershellCommand}"`);
};

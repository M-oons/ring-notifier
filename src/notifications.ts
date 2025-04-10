import { exec } from "child_process";
import { join } from "path";
import { WindowsToaster } from "node-notifier";
import { type RingCamera } from "ring-client-api";
import config from "./config";
import { type CameraEvent } from "./types";
import { openExplorer } from "./utils";

const toaster = new WindowsToaster();

export const notify = (camera: RingCamera, cameraEvent: CameraEvent, snapshotPath: string | null): void => {
    switch (cameraEvent) {
        case "motion":
            if (config.notifications.motion.toast)
                showNotification("👀 Motion detected", `Motion detected at "${camera.name}"`, snapshotPath);
            if (config.notifications.motion.sound)
                playSound(join(__dirname, "assets", "motion.wav"));
            return;

        case "ring":
            if (config.notifications.ring.toast)
                showNotification("🔔 Doorbell ring", `Doorbell ring at "${camera.name}"`, snapshotPath);
            if (config.notifications.ring.sound)
                playSound(join(__dirname, "assets", "ring.wav"));
            return;
    }
};

const showNotification = (title: string, message: string, snapshotPath: string | null): void => {
    toaster.notify({
        appID: "Ring",
        title,
        message,
        icon: snapshotPath || join(__dirname, "assets", "logo.png"),
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

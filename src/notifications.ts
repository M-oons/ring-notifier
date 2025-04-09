import { exec } from "child_process";
import { join } from "path";
import { WindowsToaster } from "node-notifier";
import { type RingCamera } from "ring-client-api";
import config from "./config";
import { type CameraEvent } from "./types";

const notifier = new WindowsToaster();

export const notify = (camera: RingCamera, cameraEvent: CameraEvent, snapshotPath: string | null): void => {
    switch (cameraEvent) {
        case "motion":
            if (config.notifications.motion.toast)
                notifier.notify({
                    appID: "Ring",
                    title: "👀 Motion detected",
                    message: `Motion detected at "${camera.name}"`,
                    icon: snapshotPath || join(__dirname, "assets", "logo.png"),
                    sound: false,
                });
            if (config.notifications.motion.sound)
                playSound(join(__dirname, "assets", "motion.wav"));
            return;

        case "ring":
            if (config.notifications.ring.toast)
                notifier.notify({
                    appID: "Ring",
                    title: "🔔 Doorbell ring",
                    message: `Doorbell ring at "${camera.name}"`,
                    icon: snapshotPath || join(__dirname, "assets", "logo.png"),
                    sound: false,
                });
            if (config.notifications.ring.sound)
                playSound(join(__dirname, "assets", "ring.wav"));
            return;
    }
};

const playSound = (soundPath: string): void => {
    const powershellCommand = `[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms') | Out-Null; $sound = New-Object System.Media.SoundPlayer; $sound.SoundLocation = '${soundPath}'; $sound.PlaySync();`;
    exec(`powershell -Command "${powershellCommand}"`);
};

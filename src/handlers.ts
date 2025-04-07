import { type RingCamera, type PushNotificationDingV2 } from "ring-client-api";
import { saveRefreshToken } from "./auth";
import { savePicture, saveVideo } from "./camera";
import { notify } from "./notifications";
import { type RefreshTokenUpdate } from "./types";
import { log } from "./utils";

export const handleRefreshTokenUpdate = async (update: RefreshTokenUpdate): Promise<void> => {
    if (!update.oldRefreshToken || !update.newRefreshToken || update.oldRefreshToken === update.newRefreshToken)
        return;

    log("Refresh token updated");
    saveRefreshToken(update.newRefreshToken);
};

export const handleNotification = (camera: RingCamera, notification: PushNotificationDingV2): void => {
    switch (notification.data.event.ding.subtype) {
        case "motion":
            handleDoorbellMotion(camera, notification);
            return;

        case "button_press":
            handleDoorbellRing(camera, notification);
            return;
    }
};

const handleDoorbellMotion = async (camera: RingCamera, notification: PushNotificationDingV2): Promise<void> => {
    log("Motion detected", camera);
    const snapshot = await savePicture(camera, "motion");
    notify(camera, "motion", snapshot);
    await saveVideo(camera, "motion", notification.data.event.ding.id);
};

const handleDoorbellRing = async (camera: RingCamera, notification: PushNotificationDingV2): Promise<void> => {
    log("(!) Doorbell ring", camera);
    const snapshot = await savePicture(camera, "ring");
    notify(camera, "ring", snapshot);
    await saveVideo(camera, "ring", notification.data.event.ding.id);
};

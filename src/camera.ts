import { createWriteStream, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { pipeline } from "stream/promises";
import { type RingCamera } from "ring-client-api";
import { type CameraEvent } from "./types";
import { getDateForFolder, log, sleep, writeFile } from "./utils";

export const savePicture = async (camera: RingCamera, cameraEvent: CameraEvent): Promise<string | null> => {
    try {
        const snapshot = await camera.getSnapshot();
        const capturePath = ensureCaptureFolderExists();
        const picturePath = join(capturePath, `${cameraEvent}_${getTimestampForFile()}.jpg`);
        writeFile(picturePath, snapshot);
        return picturePath;
    }
    catch (err) {
        log(`Error saving camera picture for ${cameraEvent} event: ${err}`);
    }
    return null;
};

export const saveVideo = async (camera: RingCamera, cameraEvent: CameraEvent, dingId: string): Promise<string | null> => {
    for (let attempt = 1; attempt <= 12; attempt++) {
        await sleep(10000);

        try {
            const recordingUrl = await camera.getRecordingUrl(dingId);
            const response = await fetch(recordingUrl);
            if (!response.ok || !response.body)
                continue;

            const capturePath = ensureCaptureFolderExists();
            const videoPath = join(capturePath, `${cameraEvent}_${getTimestampForFile()}.mp4`);
            const fileStream = createWriteStream(videoPath);
            await pipeline(response.body, fileStream);
            return videoPath;
        }
        catch {
            // recording not ready yet
        }
    }
    log(`Error saving video picture for ${cameraEvent} event`);
    return null;
};

const ensureCaptureFolderExists = (): string => {
    const capturesPath = join(`${process.env.APPDATA}`, "Ring", "captures", getDateForFolder());
    if (!existsSync(capturesPath))
        mkdirSync(capturesPath, { recursive: true });
    return capturesPath;
};

const getTimestampForFile = (): string => {
    const now = new Date();

    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const paddedDay = day.toString().padStart(2, "0");
    const paddedMonth = month.toString().padStart(2, "0");
    const paddedHours = hours.toString().padStart(2, "0");
    const paddedMinutes = minutes.toString().padStart(2, "0");
    const paddedSeconds = seconds.toString().padStart(2, "0");

    return `${year}-${paddedMonth}-${paddedDay}_${paddedHours}-${paddedMinutes}-${paddedSeconds}`;
};

import { spawn } from "child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { type RingCamera } from "ring-client-api";

export const APP_PATH = join(`${process.env.APPDATA}`, "ring-notifier");

export const ASSETS_PATH = process.env.NODE_ENV === "development"
    ? join(__dirname, "assets")
    : join(process.resourcesPath, "assets");

export const log = (text: string, ...camera: RingCamera[]): void => {
    let message = `${getTimestamp()} `;
    if (camera.length)
        message += `[${camera[0]!.name}] `;
    message += text;
    console.log(message);
    const logsFolder = ensureLogsFolderExists();
    appendFile(join(logsFolder, `log_${getTimestampForFile()}.txt`), `${message}\n`);
};

export const readFile = (path: string): string | null => {
    try {
        return readFileSync(path, { encoding: "utf-8" });
    }
    catch { }
    return null;
};

export const writeFile = (path: string, content: string | NodeJS.ArrayBufferView): void => {
    try {
        writeFileSync(path, content, { encoding: "utf-8" });
    }
    catch { }
};

export const appendFile = (path: string, content: string): void => {
    try {
        appendFileSync(path, content, { encoding: "utf-8" });
    }
    catch { }
};

export const openExplorer = (path: string, select: boolean = false): void => {
    path ||= "=";

    if (select)
        path = `/select,${path}`;

    const p = spawn("explorer", [path]);
    p.on("error", () => {
        p.kill();
    });
};

export const sleep = async (ms: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, ms));
};

export const getDateForFolder = (includeDay: boolean): string => {
    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const paddedMonth = month.toString().padStart(2, "0");

    let date = `${year}-${paddedMonth}`;

    if (includeDay) {
        const day = now.getDate();
        const paddedDay = day.toString().padStart(2, "0");
        date += `-${paddedDay}`;
    }

    return date;
};

const ensureLogsFolderExists = (): string => {
    const logsPath = join(APP_PATH, "logs", getDateForFolder(false));
    if (!existsSync(logsPath))
        mkdirSync(logsPath, { recursive: true });
    return logsPath;
};

const getTimestamp = (): string => {
    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const paddedMonth = month.toString().padStart(2, "0");
    const paddedDay = day.toString().padStart(2, "0");
    const paddedHours = hours.toString().padStart(2, "0");
    const paddedMinutes = minutes.toString().padStart(2, "0");
    const paddedSeconds = seconds.toString().padStart(2, "0");

    return `[${paddedDay}/${paddedMonth}/${year} ${paddedHours}:${paddedMinutes}:${paddedSeconds}]`;
};

const getTimestampForFile = (): string => {
    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const paddedMonth = month.toString().padStart(2, "0");
    const paddedDay = day.toString().padStart(2, "0");

    return `${year}-${paddedMonth}-${paddedDay}`;
};

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { type RingCamera } from "ring-client-api";

export const log = (text: string, ...camera: RingCamera[]): void => {
    let message = `${getTimestamp()} `;
    if (camera.length)
        message += `[${camera[0].name}] `;
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

export const sleep = async (ms: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, ms));
};

export const getDateForFolder = (): string => {
    const now = new Date();

    const month = now.getMonth() + 1;
    const paddedMonth = month.toString().padStart(2, "0");
    const year = now.getFullYear();

    return `${year}-${paddedMonth}`;
};

const ensureLogsFolderExists = (): string => {
    const logsPath = join(`${process.env.APPDATA}`, "Ring", "logs", getDateForFolder());
    if (!existsSync(logsPath))
        mkdirSync(logsPath, { recursive: true });
    return logsPath;
};

const getTimestamp = (): string => {
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

    return `[${paddedDay}/${paddedMonth}/${year} ${paddedHours}:${paddedMinutes}:${paddedSeconds}]`;
};

const getTimestampForFile = (): string => {
    const now = new Date();

    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const paddedDay = day.toString().padStart(2, "0");
    const paddedMonth = month.toString().padStart(2, "0");

    return `${year}-${paddedMonth}-${paddedDay}`;
};

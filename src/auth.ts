import { join } from "path";
import { type Auth } from "./types";
import { readFile, writeFile } from "./utils";

export const readRefreshToken = (): string => {
    const json = readFile(join(`${process.env.APPDATA}`, "Ring", "auth.json"));
    if (!json)
        return "";

    const auth = JSON.parse(json) as Auth;
    return auth.refreshToken;
};

export const saveRefreshToken = (refreshToken: string): void => {
    const auth: Auth = { refreshToken };
    const json = JSON.stringify(auth, null, 4);
    writeFile(join(`${process.env.APPDATA}`, "Ring", "auth.json"), json);
};

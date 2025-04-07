export type Auth = {
    refreshToken: string,
};

export type Config = {
    cameraPollingInterval: number,
    notifications: {
        motion: {
            toast: boolean,
            sound: boolean,
        },
        ring: {
            toast: boolean,
            sound: boolean,
        },
    },
};

export type RefreshTokenUpdate = {
    oldRefreshToken?: string,
    newRefreshToken: string,
};

export type CameraEvent = "motion" | "ring";

import { type ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';

const config: ForgeConfig = {
    packagerConfig: {
        asar: true,
        icon: "dist/assets/icon",
        extraResource: [
            "dist/assets",
        ],
    },
    makers: [
        new MakerSquirrel({
            authors: "Moons",
            description: "Ring Notifier",
            setupIcon: "dist/assets/icon.ico",
            iconUrl: "https://github.com/M-oons/ring-notifier/blob/main/src/assets/icon.png?raw=true",
        }),
    ]
};

export default config;

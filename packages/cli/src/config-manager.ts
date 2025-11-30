import Conf from "conf";

export interface CliConfig {
    apiKey: string;
    steamId: string;
    authCode: string;
}

const config = new Conf<CliConfig>({
    projectName: "cs2-pickem",
    encryptionKey: "cs2-pickem-secure-storage",
});

export const saveConfig = async (newConfig: CliConfig): Promise<void> => {
    config.set("apiKey", newConfig.apiKey);
    config.set("steamId", newConfig.steamId);
    config.set("authCode", newConfig.authCode);
};

export const loadConfig = async (): Promise<CliConfig> => {
    const apiKey = config.get("apiKey");
    const steamId = config.get("steamId");
    const authCode = config.get("authCode");

    if (!apiKey || !steamId || !authCode) {
        throw new Error(
            "Configuration not found. Run 'cs2-pickem config' to set up your credentials."
        );
    }

    return { apiKey, steamId, authCode };
};

export const hasConfig = (): boolean => {
    return Boolean(config.get("apiKey") && config.get("steamId") && config.get("authCode"));
};

export const clearConfig = (): void => {
    config.clear();
};

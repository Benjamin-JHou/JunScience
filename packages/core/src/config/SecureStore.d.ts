export declare class SecureStore {
    private configDir;
    private credentialsFile;
    private encryptionKey;
    constructor(customDir?: string);
    private ensureDirectory;
    private deriveMachineKey;
    getSecret(key: string): string | undefined;
    setSecret(key: string, value: string): void;
    deleteSecret(key: string): void;
    private loadAllSecrets;
    private saveAllSecrets;
}
export declare const globalSecureStore: SecureStore;
//# sourceMappingURL=SecureStore.d.ts.map
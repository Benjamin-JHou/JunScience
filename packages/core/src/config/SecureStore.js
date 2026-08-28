import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
export class SecureStore {
    configDir;
    credentialsFile;
    encryptionKey;
    constructor(customDir) {
        this.configDir = customDir || process.env.JUNSCIENCE_HOME || path.join(os.homedir(), '.junscience');
        this.credentialsFile = path.join(this.configDir, 'credentials.enc');
        this.encryptionKey = this.deriveMachineKey();
    }
    ensureDirectory() {
        try {
            if (!fs.existsSync(this.configDir)) {
                fs.mkdirSync(this.configDir, { recursive: true, mode: 0o700 });
            }
        }
        catch {
            // Ignore if directory creation restricted
        }
    }
    deriveMachineKey() {
        // Salt derived from OS user identity and machine characteristics
        const machineIdentifier = `${os.hostname()}:${os.userInfo().username}:${os.platform()}:junscience-v1-salt`;
        return crypto.createHash('sha256').update(machineIdentifier).digest();
    }
    getSecret(key) {
        const all = this.loadAllSecrets();
        return all[key];
    }
    setSecret(key, value) {
        const all = this.loadAllSecrets();
        all[key] = value;
        this.saveAllSecrets(all);
    }
    deleteSecret(key) {
        const all = this.loadAllSecrets();
        if (key in all) {
            delete all[key];
            this.saveAllSecrets(all);
        }
    }
    loadAllSecrets() {
        if (!fs.existsSync(this.credentialsFile)) {
            return {};
        }
        try {
            const raw = fs.readFileSync(this.credentialsFile);
            if (raw.length < 28)
                return {}; // 12 bytes IV + 16 bytes auth tag + ciphertext
            const iv = raw.subarray(0, 12);
            const authTag = raw.subarray(12, 28);
            const ciphertext = raw.subarray(28);
            const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
            decipher.setAuthTag(authTag);
            const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
            return JSON.parse(decrypted.toString('utf-8'));
        }
        catch (err) {
            console.warn('[SecureStore] Failed to decrypt credentials file. Initializing empty vault.', err);
            return {};
        }
    }
    saveAllSecrets(secrets) {
        this.ensureDirectory();
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
        const plaintext = Buffer.from(JSON.stringify(secrets), 'utf-8');
        const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
        const authTag = cipher.getAuthTag();
        const output = Buffer.concat([iv, authTag, ciphertext]);
        fs.writeFileSync(this.credentialsFile, output, { mode: 0o600 });
    }
}
export const globalSecureStore = new SecureStore();
//# sourceMappingURL=SecureStore.js.map
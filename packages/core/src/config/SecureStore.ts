import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

export class SecureStore {
  private customDir?: string;
  private encryptionKey: Buffer;

  constructor(customDir?: string) {
    this.customDir = customDir;
    this.encryptionKey = this.deriveMachineKey();
  }

  private getConfigDir(): string {
    return this.customDir || process.env.JUNSCIENCE_HOME || path.join(os.homedir(), '.junscience');
  }

  private getCredentialsFile(): string {
    return path.join(this.getConfigDir(), 'credentials.enc');
  }

  private ensureDirectory(): void {
    try {
      const dir = this.getConfigDir();
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
      }
    } catch {
      // Ignore if directory creation restricted
    }
  }

  private deriveMachineKey(): Buffer {
    // Salt derived from OS user identity and machine characteristics
    const machineIdentifier = `${os.hostname()}:${os.userInfo().username}:${os.platform()}:junscience-v1-salt`;
    return crypto.createHash('sha256').update(machineIdentifier).digest();
  }

  public getSecret(key: string): string | undefined {
    const all = this.loadAllSecrets();
    return all[key];
  }

  public setSecret(key: string, value: string): void {
    const all = this.loadAllSecrets();
    all[key] = value;
    this.saveAllSecrets(all);
  }

  public deleteSecret(key: string): void {
    const all = this.loadAllSecrets();
    if (key in all) {
      delete all[key];
      this.saveAllSecrets(all);
    }
  }

  private loadAllSecrets(): Record<string, string> {
    const credFile = this.getCredentialsFile();
    if (!fs.existsSync(credFile)) {
      return {};
    }

    try {
      const raw = fs.readFileSync(credFile);
      if (raw.length < 28) return {}; // 12 bytes IV + 16 bytes auth tag + ciphertext

      const iv = raw.subarray(0, 12);
      const authTag = raw.subarray(12, 28);
      const ciphertext = raw.subarray(28);

      const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return JSON.parse(decrypted.toString('utf-8'));
    } catch (err) {
      console.warn('[SecureStore] Failed to decrypt credentials file. Initializing empty vault.', err);
      return {};
    }
  }

  private saveAllSecrets(secrets: Record<string, string>): void {
    this.ensureDirectory();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);

    const plaintext = Buffer.from(JSON.stringify(secrets), 'utf-8');
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();

    const output = Buffer.concat([iv, authTag, ciphertext]);
    fs.writeFileSync(this.getCredentialsFile(), output, { mode: 0o600 });
  }
}

export const globalSecureStore = new SecureStore();

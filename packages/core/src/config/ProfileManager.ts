import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { ModelProfile } from '../types/model.js';
import { globalSecureStore, SecureStore } from './SecureStore.js';
import { validateProfile, normalizeBaseUrl } from './ModelConfig.js';

export interface JunScienceConfigFile {
  version: string;
  activeProfileId?: string;
  profiles: Omit<ModelProfile, 'apiKey'>[];
}

export class ProfileManager {
  private customDir?: string;
  private secureStore: SecureStore;

  constructor(customDir?: string, customSecureStore?: SecureStore) {
    this.customDir = customDir;
    this.secureStore = customSecureStore || globalSecureStore;
  }

  private getConfigDir(): string {
    return this.customDir || process.env.JUNSCIENCE_HOME || path.join(os.homedir(), '.junscience');
  }

  private getConfigFile(): string {
    return path.join(this.getConfigDir(), 'config.json');
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

  private readConfigFile(): JunScienceConfigFile {
    const configFile = this.getConfigFile();
    if (!fs.existsSync(configFile)) {
      return { version: '1.0.0', profiles: [] };
    }
    try {
      const raw = fs.readFileSync(configFile, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return { version: '1.0.0', profiles: [] };
    }
  }

  private writeConfigFile(data: JunScienceConfigFile): void {
    this.ensureDirectory();
    fs.writeFileSync(this.getConfigFile(), JSON.stringify(data, null, 2), { mode: 0o600 });
  }

  public listProfiles(): ModelProfile[] {
    const config = this.readConfigFile();
    return config.profiles.map((p) => {
      const apiKey = this.secureStore.getSecret(`api_key:${p.id}`);
      return {
        ...p,
        apiKey: apiKey || '',
      };
    });
  }

  public getProfile(id: string): ModelProfile | undefined {
    const profiles = this.listProfiles();
    return profiles.find((p) => p.id === id);
  }

  public getActiveProfile(): ModelProfile | undefined {
    const config = this.readConfigFile();
    const profiles = this.listProfiles();
    if (config.activeProfileId) {
      const active = profiles.find((p) => p.id === config.activeProfileId);
      if (active) return active;
    }
    return profiles.find((p) => p.isDefault) || profiles[0];
  }

  public saveProfile(profile: ModelProfile): { success: boolean; profile?: ModelProfile; errors?: string[] } {
    const validation = validateProfile(profile);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const config = this.readConfigFile();
    const now = new Date().toISOString();
    const id = profile.id || `prof-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    // Normalize base URL
    const cleanBaseUrl = normalizeBaseUrl(profile.baseUrl);

    // Save API key to encrypted vault if provided
    if (profile.apiKey !== undefined) {
      this.secureStore.setSecret(`api_key:${id}`, profile.apiKey);
    }

    const { apiKey: _, ...profileWithoutKey } = profile;
    const cleanProfile: Omit<ModelProfile, 'apiKey'> = {
      ...profileWithoutKey,
      id,
      baseUrl: cleanBaseUrl,
      updatedAt: now,
      createdAt: profile.createdAt || now,
    };

    const existingIndex = config.profiles.findIndex((p) => p.id === id);
    if (existingIndex >= 0) {
      config.profiles[existingIndex] = cleanProfile;
    } else {
      if (config.profiles.length === 0 || profile.isDefault) {
        config.profiles.forEach((p) => (p.isDefault = false));
        cleanProfile.isDefault = true;
        config.activeProfileId = id;
      }
      config.profiles.push(cleanProfile);
    }

    this.writeConfigFile(config);

    const saved = this.getProfile(id);
    return { success: true, profile: saved };
  }

  public deleteProfile(id: string): boolean {
    const config = this.readConfigFile();
    const initialLen = config.profiles.length;
    config.profiles = config.profiles.filter((p) => p.id !== id);

    if (config.profiles.length !== initialLen) {
      this.secureStore.deleteSecret(`api_key:${id}`);
      if (config.activeProfileId === id) {
        config.activeProfileId = config.profiles[0]?.id;
      }
      this.writeConfigFile(config);
      return true;
    }
    return false;
  }

  public setActiveProfile(id: string): boolean {
    const config = this.readConfigFile();
    const target = config.profiles.find((p) => p.id === id);
    if (target) {
      config.activeProfileId = id;
      config.profiles.forEach((p) => (p.isDefault = p.id === id));
      this.writeConfigFile(config);
      return true;
    }
    return false;
  }
}

export const globalProfileManager = new ProfileManager();

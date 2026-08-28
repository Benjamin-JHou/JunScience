import { ModelProfile } from '../types/model';
import { SecureStore } from './SecureStore';
export interface JunScienceConfigFile {
    version: string;
    activeProfileId?: string;
    profiles: Omit<ModelProfile, 'apiKey'>[];
}
export declare class ProfileManager {
    private configDir;
    private configFile;
    private secureStore;
    constructor(customDir?: string, customSecureStore?: SecureStore);
    private ensureDirectory;
    private readConfigFile;
    private writeConfigFile;
    listProfiles(): ModelProfile[];
    getProfile(id: string): ModelProfile | undefined;
    getActiveProfile(): ModelProfile | undefined;
    saveProfile(profile: ModelProfile): {
        success: boolean;
        profile?: ModelProfile;
        errors?: string[];
    };
    deleteProfile(id: string): boolean;
    setActiveProfile(id: string): boolean;
}
export declare const globalProfileManager: ProfileManager;
//# sourceMappingURL=ProfileManager.d.ts.map
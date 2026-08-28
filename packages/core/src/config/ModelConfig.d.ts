import { ModelProfile } from '../types/model';
export declare function normalizeBaseUrl(url: string): string;
export declare function validateProfile(profile: Partial<ModelProfile>): {
    valid: boolean;
    errors: string[];
};
export declare function createDefaultProfile(override?: Partial<ModelProfile>): ModelProfile;
//# sourceMappingURL=ModelConfig.d.ts.map
import { SkillMetadata } from '../types/skills';
export declare class SkillRegistry {
    private skills;
    constructor();
    private initDefaultSkills;
    register(skill: SkillMetadata): void;
    get(name: string): SkillMetadata | undefined;
    list(): SkillMetadata[];
    listByTier(tier: 'tier0' | 'tier1' | 'tier2'): SkillMetadata[];
    discover(query: string, maxResults?: number): SkillMetadata[];
}
export declare const globalSkillRegistry: SkillRegistry;
//# sourceMappingURL=SkillRegistry.d.ts.map
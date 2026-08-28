export type SkillTier = 'tier0' | 'tier1' | 'tier2';
export interface SkillDependencies {
    python?: string[];
    system?: string[];
    environmentVariables?: string[];
}
export interface SkillMetadata {
    name: string;
    displayName: string;
    description: string;
    category: 'literature' | 'biology' | 'chemistry' | 'ml' | 'statistics' | 'visualization';
    tier: SkillTier;
    version: string;
    author: string;
    dependencies?: SkillDependencies;
    keywords: string[];
    instructions: string;
    examples: string[];
}
//# sourceMappingURL=skills.d.ts.map
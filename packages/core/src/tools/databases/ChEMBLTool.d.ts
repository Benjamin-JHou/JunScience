import { ToolDefinition } from '../../types/tools';
export interface ChEMBLInput {
    targetOrCompound: string;
    activityType?: 'IC50' | 'Ki' | 'Kd' | 'all';
}
export declare const ChEMBLTool: ToolDefinition<ChEMBLInput>;
//# sourceMappingURL=ChEMBLTool.d.ts.map
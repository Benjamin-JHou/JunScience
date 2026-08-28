import { ToolDefinition } from '../../types/tools';
export interface DataAnalysisInput {
    datasetIdOrPath: string;
    analysisType: 'differential_expression' | 'clustering' | 'pathway_enrichment' | 'quality_control';
    parameters?: Record<string, any>;
}
export declare const DataAnalysisTool: ToolDefinition<DataAnalysisInput>;
//# sourceMappingURL=DataAnalysisTool.d.ts.map
import { ToolDefinition } from '../../types/tools';
export interface FigureGeneratorInput {
    figureType: 'volcano' | 'pca_umap' | 'heatmap' | 'pathway_enrichment';
    title?: string;
    dataReference?: string;
}
export declare const FigureGeneratorTool: ToolDefinition<FigureGeneratorInput>;
//# sourceMappingURL=FigureGeneratorTool.d.ts.map
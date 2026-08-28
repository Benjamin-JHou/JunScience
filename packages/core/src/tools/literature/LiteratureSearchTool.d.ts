import { ToolDefinition } from '../../types/tools';
export interface LiteratureSearchInput {
    query: string;
    limit?: number;
    sources?: ('pubmed' | 'biorxiv' | 'openalex')[];
}
export declare const LiteratureSearchTool: ToolDefinition<LiteratureSearchInput>;
//# sourceMappingURL=LiteratureSearchTool.d.ts.map
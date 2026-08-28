import { globalToolRegistry } from './ToolRegistry';
import { LiteratureSearchTool } from './literature/LiteratureSearchTool';
import { UniProtTool } from './databases/UniProtTool';
import { ChEMBLTool } from './databases/ChEMBLTool';
import { PubChemTool } from './databases/PubChemTool';
import { PDBTool } from './databases/PDBTool';
import { PythonRunnerTool } from './execution/PythonRunnerTool';
import { DataAnalysisTool } from './execution/DataAnalysisTool';
import { FigureGeneratorTool } from './artifacts/FigureGeneratorTool';
export function initializeDefaultTools() {
    globalToolRegistry.register(LiteratureSearchTool);
    globalToolRegistry.register(UniProtTool);
    globalToolRegistry.register(ChEMBLTool);
    globalToolRegistry.register(PubChemTool);
    globalToolRegistry.register(PDBTool);
    globalToolRegistry.register(PythonRunnerTool);
    globalToolRegistry.register(DataAnalysisTool);
    globalToolRegistry.register(FigureGeneratorTool);
}
// Auto-initialize default tool registrations
initializeDefaultTools();
export { globalToolRegistry, LiteratureSearchTool, UniProtTool, ChEMBLTool, PubChemTool, PDBTool, PythonRunnerTool, DataAnalysisTool, FigureGeneratorTool, };
//# sourceMappingURL=index.js.map
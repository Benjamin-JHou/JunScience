import { globalToolRegistry } from './ToolRegistry.js';
import { LiteratureSearchTool } from './literature/LiteratureSearchTool.js';
import { ArXivTool } from './literature/ArXivTool.js';
import { BioRxivTool } from './literature/BioRxivTool.js';
import { PapersWithCodeTool } from './literature/PapersWithCodeTool.js';
import { HuggingFaceHubTool } from './literature/HuggingFaceHubTool.js';
import { UniProtTool } from './databases/UniProtTool.js';
import { ChEMBLTool } from './databases/ChEMBLTool.js';
import { PubChemTool } from './databases/PubChemTool.js';
import { PDBTool } from './databases/PDBTool.js';
import { PythonRunnerTool } from './execution/PythonRunnerTool.js';
import { FileEditorTool } from './execution/FileEditorTool.js';
import { DataAnalysisTool } from './execution/DataAnalysisTool.js';
import { FigureGeneratorTool } from './artifacts/FigureGeneratorTool.js';
import { ClinicalTrialsTool } from './medical/ClinicalTrialsTool.js';
import { OpenFDATool } from './medical/OpenFDATool.js';
import { RxNormTool } from './medical/RxNormTool.js';
import { DailyMedTool } from './medical/DailyMedTool.js';
import { MedlinePlusTool } from './medical/MedlinePlusTool.js';
import { ClinicalNlpTool } from './medical/ClinicalNlpTool.js';
import { MedicalImagingTool } from './medical/MedicalImagingTool.js';

export function initializeDefaultTools(): void {
  globalToolRegistry.register(LiteratureSearchTool);
  globalToolRegistry.register(ArXivTool);
  globalToolRegistry.register(BioRxivTool);
  globalToolRegistry.register(PapersWithCodeTool);
  globalToolRegistry.register(HuggingFaceHubTool);
  globalToolRegistry.register(UniProtTool);
  globalToolRegistry.register(ChEMBLTool);
  globalToolRegistry.register(PubChemTool);
  globalToolRegistry.register(PDBTool);
  globalToolRegistry.register(PythonRunnerTool);
  globalToolRegistry.register(FileEditorTool);
  globalToolRegistry.register(DataAnalysisTool);
  globalToolRegistry.register(FigureGeneratorTool);
  globalToolRegistry.register(ClinicalTrialsTool);
  globalToolRegistry.register(OpenFDATool);
  globalToolRegistry.register(RxNormTool);
  globalToolRegistry.register(DailyMedTool);
  globalToolRegistry.register(MedlinePlusTool);
  globalToolRegistry.register(ClinicalNlpTool);
  globalToolRegistry.register(MedicalImagingTool);
}

// Auto-initialize default tool registrations
initializeDefaultTools();

export {
  globalToolRegistry,
  LiteratureSearchTool,
  ArXivTool,
  BioRxivTool,
  PapersWithCodeTool,
  HuggingFaceHubTool,
  UniProtTool,
  ChEMBLTool,
  PubChemTool,
  PDBTool,
  PythonRunnerTool,
  FileEditorTool,
  DataAnalysisTool,
  FigureGeneratorTool,
  ClinicalTrialsTool,
  OpenFDATool,
  RxNormTool,
  DailyMedTool,
  MedlinePlusTool,
  ClinicalNlpTool,
  MedicalImagingTool,
};

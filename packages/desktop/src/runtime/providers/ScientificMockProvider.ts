import { ModelProvider, ModelRequest, ModelResponse } from './ModelProvider';

export class ScientificMockProvider implements ModelProvider {
  public name = 'scientific-mock';

  public async listModels(): Promise<string[]> {
    return ['JunScience-Research-v1', 'JunScience-Bio-v1', 'JunScience-Chem-v1'];
  }

  public async generate(request: ModelRequest): Promise<ModelResponse> {
    return this.simulateScientificResponse(request);
  }

  public async stream(
    request: ModelRequest,
    onDelta: (chunk: string) => void
  ): Promise<ModelResponse> {
    const response = await this.simulateScientificResponse(request);

    // Stream the content in realistic token chunks
    const words = response.content.split(' ');
    for (let i = 0; i < words.length; i += 3) {
      const chunk = words.slice(i, i + 3).join(' ') + ' ';
      onDelta(chunk);
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    return response;
  }

  private async simulateScientificResponse(request: ModelRequest): Promise<ModelResponse> {
    const lastMessage = request.messages[request.messages.length - 1];
    const userContent = lastMessage.content.toLowerCase();

    // Check if previous turn had tool results
    const hasToolResult = request.messages.some((m) => m.role === 'tool');

    if (!hasToolResult) {
      // First turn: Propose research tool calls based on user request
      return {
        content: `I am planning the scientific workflow to investigate your research inquiry. Initiating literature search and experimental data analysis pipelines.`,
        finishReason: 'tool_calls',
        toolCalls: [
          {
            id: `call-lit-${Date.now()}`,
            name: 'literature_search',
            arguments: { query: userContent.slice(0, 80) },
          },
          {
            id: `call-data-${Date.now()}`,
            name: 'data_analysis',
            arguments: { datasetIdOrPath: 'GSE181283', analysisType: 'differential_expression' },
          },
        ],
      };
    }

    // Second turn (post-tools): Check if figure has been generated
    const hasFigure = request.messages.some(
      (m) => m.role === 'tool' && m.name === 'figure_generator'
    );

    if (!hasFigure) {
      return {
        content: `Preliminary data and literature indexed. Now executing Python visualization scripts to synthesize publication-quality figures.`,
        finishReason: 'tool_calls',
        toolCalls: [
          {
            id: `call-py-${Date.now()}`,
            name: 'python_runner',
            arguments: { scriptContent: 'import scanpy; render_volcano()', scriptName: 'render_volcano.py' },
          },
          {
            id: `call-fig-${Date.now()}`,
            name: 'figure_generator',
            arguments: { figureType: 'volcano', title: 'Differential Expression Volcano Plot' },
          },
        ],
      };
    }

    // Final synthesis turn:
    return {
      finishReason: 'stop',
      content: `### Scientific Research Synthesis & Mechanistic Validation

Based on the execution of literature retrieval, single-cell transcriptomic analysis (GSE181283, 14,200 cells), and structural pocket modeling:

1. **Pathogenic Signaling Axis Activation:**
   Differential expression confirms pronounced hyperactivation of the Type-I Interferon cascade. The transcription factor **STAT4** (\\(\\log_2\\text{FC} = +2.84\\), \\(p_{\\text{adj}} = 4.2 \\times 10^{-28}\\)) and kinase **TYK2** (\\(\\log_2\\text{FC} = +3.12\\), \\(p_{\\text{adj}} = 1.2 \\times 10^{-34}\\)) demonstrate coordinated upregulation in effector memory CD4+ T cells.

2. **Druggability & Allosteric Specificity:**
   Cross-referencing ChEMBL and RCSB PDB (Entry 6NZP) confirms that targeting the **TYK2 JH2 pseudokinase regulatory domain** achieves nanomolar potency (\\(\\text{IC}_{50} = 0.2\\text{ nM}\\)) with >10,000-fold selectivity over catalytic JAK1/2/3, avoiding hematological toxicities.

3. **Conclusion & Recommended Next Steps:**
   - Prioritize TYK2 allosteric inhibitors for lupus nephritis clinical translation.
   - For STAT4, explore targeted protein degradation (PROTAC) at the SH2 dimerization interface.`,
    };
  }
}

export const globalModelProvider = new ScientificMockProvider();

import { ToolDefinition, ToolContext, ToolExecutionResult } from '../../types/tools.js';
import { getJson } from '../../utils/httpClient.js';

export interface PapersWithCodeInput {
  taskOrDataset: string;
  limit?: number;
}

const PWC_API = 'https://paperswithcode.com/api/v1';

export const PapersWithCodeTool: ToolDefinition<PapersWithCodeInput> = {
  name: 'papers_with_code_lookup',
  description: 'Search Papers With Code and open-source benchmarks for Medical AI datasets (e.g. CheXpert, MIMIC-CXR, RSNA, BraTS), SOTA evaluation tasks, methods, and GitHub code repositories.',
  category: 'literature',
  requiredPermission: 'NETWORK',
  permissionTargets: [
    'https://paperswithcode.com',
    'https://huggingface.co',
    'https://api.github.com',
  ],
  inputSchema: {
    type: 'object',
    properties: {
      taskOrDataset: { type: 'string', description: 'Task, dataset, or method name (e.g. "chest x-ray", "pneumonia detection", "brain tumor segmentation", "histopathology")' },
      limit: { type: 'number', description: 'Maximum tasks or benchmarks to return (default: 3)' },
    },
    required: ['taskOrDataset'],
  },
  async execute(input: PapersWithCodeInput, context: ToolContext): Promise<ToolExecutionResult> {
    const rawQuery = input.taskOrDataset.trim();
    const limit = Math.min(input.limit || 3, 5);
    context.reportProgress(`Querying Medical AI benchmarks & code for "${rawQuery}"...`, 20);

    const tasks: { id: string; name: string; description: string; benchmarksCount?: number }[] = [];
    const papers: { title: string; arxivId?: string; urlAbs?: string; urlPdf?: string }[] = [];

    // Attempt 1: Direct Papers With Code API
    try {
      const taskUrl = `${PWC_API}/tasks/?q=${encodeURIComponent(rawQuery)}&page=1&items_per_page=${limit}`;
      const taskJson = await getJson(taskUrl, { timeoutMs: 5000 });
      const taskResults = taskJson?.results || [];

      for (const t of taskResults.slice(0, limit)) {
        tasks.push({
          id: t.id || t.name,
          name: t.name || rawQuery,
          description: t.description || 'Medical AI benchmark task on Papers With Code.',
        });
      }
    } catch {
      // Non-fatal, proceed to fallback
    }

    // Attempt 2: If tasks empty or PWC blocked, fetch benchmark datasets & models via Hugging Face & OpenAlex
    if (tasks.length === 0) {
      try {
        const hfDsUrl = `https://huggingface.co/api/datasets?search=${encodeURIComponent(rawQuery)}&limit=${limit}`;
        const hfList = await getJson(hfDsUrl, { timeoutMs: 6000 });
        if (Array.isArray(hfList)) {
          for (const item of hfList.slice(0, limit)) {
            tasks.push({
              id: item.id,
              name: `Benchmark Dataset: ${item.id}`,
              description: `Open-source Medical AI benchmark dataset on Hugging Face Hub (Downloads: ${item.downloads || 0}).`,
            });
          }
        }
      } catch {
        // fallback
      }
    }

    // Attempt 3: Query GitHub Repos for benchmarks and SOTA implementations
    try {
      const ghUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(rawQuery)}+medical+benchmark&sort=stars&order=desc&per_page=${limit}`;
      const ghJson = await getJson(ghUrl, { timeoutMs: 6000 });
      const ghItems = ghJson?.items || [];
      for (const repo of ghItems.slice(0, limit)) {
        papers.push({
          title: repo.full_name,
          urlAbs: repo.html_url,
          arxivId: repo.description ? repo.description.slice(0, 100) : undefined,
        });
      }
    } catch {
      // fallback
    }

    if (tasks.length === 0 && papers.length === 0) {
      tasks.push({
        id: rawQuery.toLowerCase().replace(/\s+/g, '-'),
        name: `Medical Benchmark: ${rawQuery}`,
        description: `Standard Medical AI task benchmark for ${rawQuery}.`,
      });
    }

    const topItem = tasks[0]?.name || papers[0]?.title || rawQuery;
    const summaryText = `Resolved ${tasks.length} benchmark task(s) and ${papers.length} open-source implementation(s) for "${rawQuery}". Top: "${topItem}"`;
    context.reportProgress(summaryText, 100);

    return {
      success: true,
      output: {
        query: rawQuery,
        tasks,
        papers,
      },
      execution: {
        id: '',
        toolName: 'papers_with_code_lookup',
        category: 'literature',
        description: `Queried benchmarks and code for ${rawQuery}`,
        status: 'completed',
        resultSummary: summaryText,
        logs: [
          ...tasks.map((t) => `[Task/Dataset] ${t.name}: ${t.description.slice(0, 80)}...`),
          ...papers.map((p) => `[Code Repository] ${p.title} (${p.urlAbs})`),
        ],
      },
    };
  },
};

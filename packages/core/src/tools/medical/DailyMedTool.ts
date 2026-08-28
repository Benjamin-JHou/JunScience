import { ToolDefinition, ToolContext, ToolExecutionResult } from '../../types/tools.js';
import { getJson } from '../../utils/httpClient.js';

export interface DailyMedInput {
  drugName: string;
}

const DAILYMED_BASE = 'https://dailymed.nlm.nih.gov/dailymed/services/v2';

export const DailyMedTool: ToolDefinition<DailyMedInput> = {
  name: 'dailymed_lookup',
  description: 'Query NLM DailyMed database for official FDA Structured Product Labels (SPL), package inserts, labeler/manufacturer information, and package insert publication history.',
  category: 'databases',
  requiredPermission: 'NETWORK',
  inputSchema: {
    type: 'object',
    properties: {
      drugName: { type: 'string', description: 'Brand or generic drug name (e.g. Sotyktu, Deucravacitinib, Lipitor, Atorvastatin)' },
    },
    required: ['drugName'],
  },
  async execute(input: DailyMedInput, context: ToolContext): Promise<ToolExecutionResult> {
    const rawQuery = input.drugName.trim();
    context.reportProgress(`Querying NLM DailyMed for "${rawQuery}"...`, 20);

    try {
      const splUrl = `${DAILYMED_BASE}/spls.json?drug_name=${encodeURIComponent(rawQuery)}&page=1&pagesize=3`;
      const splJson = await getJson(splUrl, { timeoutMs: 8000 });
      const data = splJson?.data || [];

      if (data.length === 0) {
        return {
          success: false,
          output: null,
          error: `No official FDA Structured Product Labels found on DailyMed for "${rawQuery}".`,
          execution: {
            id: '',
            toolName: 'dailymed_lookup',
            category: 'databases',
            description: `Queried DailyMed for ${rawQuery}`,
            status: 'failed',
            logs: [`Drug: ${rawQuery}`, `Status: 0 SPLs returned by DailyMed API`],
          },
        };
      }

      const splRecords = data.map((item: any) => ({
        setId: item.setid,
        title: item.title,
        labeler: item.labeler || 'Unknown Manufacturer',
        publishedDate: item.published_date || 'N/A',
        dailymedUrl: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${item.setid}`,
      }));

      const top = splRecords[0];
      const summary = `Resolved ${splRecords.length} official package label(s) on DailyMed (Top: ${top.title.slice(0, 60)}... by ${top.labeler}).`;
      context.reportProgress(summary, 100);

      return {
        success: true,
        output: {
          drug: rawQuery,
          totalReturned: splRecords.length,
          splRecords,
          topPackageInsertUrl: top.dailymedUrl,
        },
        execution: {
          id: '',
          toolName: 'dailymed_lookup',
          category: 'databases',
          description: `Queried DailyMed for ${rawQuery}`,
          status: 'completed',
          resultSummary: summary,
          logs: [
            `Drug: ${rawQuery} -> SetID: ${top.setId}`,
            `Labeler: ${top.labeler} | Published: ${top.publishedDate}`,
            `DailyMed URL: ${top.dailymedUrl}`,
          ],
        },
      };
    } catch (err: any) {
      return {
        success: false,
        output: null,
        error: `DailyMed API error: ${err?.message || String(err)}`,
        execution: {
          id: '',
          toolName: 'dailymed_lookup',
          category: 'databases',
          description: `Failed to query DailyMed for ${rawQuery}`,
          status: 'failed',
          logs: [`Target: ${rawQuery}`, `Error: ${err?.message || String(err)}`],
        },
      };
    }
  },
};

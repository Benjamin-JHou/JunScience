import { ToolDefinition, ToolContext, ToolExecutionResult } from '../../types/tools.js';
import { getJson } from '../../utils/httpClient.js';

export interface OpenFDAInput {
  drugName: string;
  queryType?: 'label' | 'adverse_events' | 'both';
}

const FDA_BASE = 'https://api.fda.gov/drug';

export const OpenFDATool: ToolDefinition<OpenFDAInput> = {
  name: 'openfda_lookup',
  description: 'Query official US FDA regulatory data (openFDA API) for approved drug package inserts, black box warnings (boxed_warning), clinical indications, contraindications, and FAERS post-marketing adverse event safety signals.',
  category: 'databases',
  requiredPermission: 'NETWORK',
  inputSchema: {
    type: 'object',
    properties: {
      drugName: { type: 'string', description: 'Brand or generic drug name (e.g. Sotyktu, Deucravacitinib, Humira, Adalimumab, Donepezil)' },
      queryType: { type: 'string', enum: ['label', 'adverse_events', 'both'], default: 'both', description: 'Type of FDA data to retrieve' },
    },
    required: ['drugName'],
  },
  async execute(input: OpenFDAInput, context: ToolContext): Promise<ToolExecutionResult> {
    const rawQuery = input.drugName.trim();
    const queryType = input.queryType || 'both';

    context.reportProgress(`Querying openFDA API for "${rawQuery}" [Mode: ${queryType}]...`, 20);

    let labelData: any = null;
    let adverseEvents: { reaction: string; count: number }[] = [];

    try {
      // Step 1: Query Drug Label
      if (queryType === 'label' || queryType === 'both') {
        const brandQuery = `openfda.brand_name:"${encodeURIComponent(rawQuery)}"`;
        const genericQuery = `openfda.generic_name:"${encodeURIComponent(rawQuery)}"`;
        const labelUrl = `${FDA_BASE}/label.json?search=(${brandQuery}+${genericQuery})&limit=1`;

        try {
          const labelJson = await getJson(labelUrl, { timeoutMs: 8000 });
          if (labelJson?.results && labelJson.results.length > 0) {
            const raw = labelJson.results[0];
            labelData = {
              brandName: raw.openfda?.brand_name?.[0] || rawQuery,
              genericName: raw.openfda?.generic_name?.[0] || rawQuery,
              manufacturer: raw.openfda?.manufacturer_name?.[0] || 'Unknown',
              boxedWarning: raw.boxed_warning?.[0]?.slice(0, 400) || 'None annotated (No Black Box Warning)',
              indicationsAndUsage: raw.indications_and_usage?.[0]?.slice(0, 400) || 'N/A',
              contraindications: raw.contraindications?.[0]?.slice(0, 300) || 'None listed',
              mechanismOfAction: raw.mechanism_of_action?.[0]?.slice(0, 300) || 'N/A',
              route: raw.openfda?.route?.[0] || 'Oral / Injectable',
            };
          }
        } catch {
          // Label query fallback
        }
      }

      // Step 2: Query FAERS Adverse Events
      if (queryType === 'adverse_events' || queryType === 'both') {
        const eventUrl = `${FDA_BASE}/event.json?search=patient.drug.medicinalproduct:"${encodeURIComponent(
          rawQuery
        )}"&count=patient.reaction.reactionmeddrapt.exact`;

        try {
          const eventJson = await getJson(eventUrl, { timeoutMs: 8000 });
          const rawEvents = eventJson?.results || [];
          adverseEvents = rawEvents.slice(0, 6).map((e: any) => ({
            reaction: e.term || 'Unknown Reaction',
            count: e.count || 0,
          }));
        } catch {
          // Events fallback
        }
      }

      if (!labelData && adverseEvents.length === 0) {
        return {
          success: false,
          output: null,
          error: `No FDA regulatory records or FAERS adverse event reports found for "${rawQuery}".`,
          execution: {
            id: '',
            toolName: 'openfda_lookup',
            category: 'databases',
            description: `Queried openFDA for ${rawQuery}`,
            status: 'failed',
            logs: [`Drug: ${rawQuery}`, `Status: 0 records returned by openFDA API`],
          },
        };
      }

      const structuredOutput = {
        query: rawQuery,
        label: labelData,
        topAdverseEvents: adverseEvents,
        hasBlackBoxWarning: labelData?.boxedWarning && !labelData.boxedWarning.includes('None annotated'),
      };

      const summary = labelData
        ? `Resolved FDA label for ${labelData.brandName} (${labelData.genericName}, Mfr: ${labelData.manufacturer}). Boxed warning: ${structuredOutput.hasBlackBoxWarning ? 'YES' : 'NO'}. Found ${adverseEvents.length} top FAERS safety signals.`
        : `Retrieved ${adverseEvents.length} top FAERS adverse event signals for ${rawQuery}.`;

      context.reportProgress(summary, 100);

      return {
        success: true,
        output: structuredOutput,
        execution: {
          id: '',
          toolName: 'openfda_lookup',
          category: 'databases',
          description: `Queried openFDA for ${rawQuery}`,
          status: 'completed',
          resultSummary: summary,
          logs: [
            `Drug: ${rawQuery}`,
            ...(labelData ? [`Brand: ${labelData.brandName} (${labelData.genericName}) | Mfr: ${labelData.manufacturer}`, `Indications: ${labelData.indicationsAndUsage.slice(0, 100)}...`] : []),
            ...(adverseEvents.length > 0 ? [`FAERS Signals: ${adverseEvents.map((a) => `${a.reaction} (${a.count})`).join(', ')}`] : []),
          ],
        },
      };
    } catch (err: any) {
      return {
        success: false,
        output: null,
        error: `openFDA API error: ${err?.message || String(err)}`,
        execution: {
          id: '',
          toolName: 'openfda_lookup',
          category: 'databases',
          description: `Failed to query openFDA for ${rawQuery}`,
          status: 'failed',
          logs: [`Target: ${rawQuery}`, `Error: ${err?.message || String(err)}`],
        },
      };
    }
  },
};

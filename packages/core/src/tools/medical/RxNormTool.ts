import { ToolDefinition, ToolContext, ToolExecutionResult } from '../../types/tools.js';
import { getJson } from '../../utils/httpClient.js';

export interface RxNormInput {
  drugNameOrRxCUI: string;
  checkInteractions?: boolean;
}

const RXNAV_BASE = 'https://rxnav.nlm.nih.gov/REST';

export const RxNormTool: ToolDefinition<RxNormInput> = {
  name: 'rxnorm_lookup',
  description: 'Query NLM RxNorm / RxNav REST API for standardized clinical drug nomenclature, canonical RxCUI concept identifiers, active ingredients, and drug-drug interactions (DDIs).',
  category: 'databases',
  requiredPermission: 'NETWORK',
  inputSchema: {
    type: 'object',
    properties: {
      drugNameOrRxCUI: { type: 'string', description: 'Drug brand/generic name (e.g. Deucravacitinib, Aspirin, Warfarin, Donepezil) or RxCUI ID (e.g. 2617730, 1191)' },
      checkInteractions: { type: 'boolean', default: true, description: 'Whether to fetch known drug-drug interactions for this clinical concept' },
    },
    required: ['drugNameOrRxCUI'],
  },
  async execute(input: RxNormInput, context: ToolContext): Promise<ToolExecutionResult> {
    const rawQuery = input.drugNameOrRxCUI.trim();
    const checkInteractions = input.checkInteractions !== false;

    context.reportProgress(`Querying NLM RxNorm for "${rawQuery}"...`, 20);

    let rxcui: string | null = null;
    let canonicalName = rawQuery;
    let interactions: { interactingDrug: string; severity: string; description: string }[] = [];

    try {
      const isDirectRxcui = /^[0-9]+$/.test(rawQuery);

      if (isDirectRxcui) {
        rxcui = rawQuery;
      } else {
        // Step 1: Look up RxCUI by name
        const findUrl = `${RXNAV_BASE}/rxcui.json?name=${encodeURIComponent(rawQuery)}`;
        try {
          const findJson = await getJson(findUrl, { timeoutMs: 8000 });
          const idList = findJson?.idGroup?.rxnormId;
          if (Array.isArray(idList) && idList.length > 0) {
            rxcui = idList[0];
          }
        } catch {
          // fallback to approximate matching
          const approxUrl = `${RXNAV_BASE}/approximateTerm.json?term=${encodeURIComponent(rawQuery)}&maxEntries=1`;
          const approxJson = await getJson(approxUrl, { timeoutMs: 8000 });
          const candidate = approxJson?.approximateGroup?.candidate?.[0];
          if (candidate?.rxcui) {
            rxcui = candidate.rxcui;
            canonicalName = candidate.name || rawQuery;
          }
        }
      }

      if (!rxcui) {
        return {
          success: false,
          output: null,
          error: `No standardized RxCUI identifier found in NLM RxNorm for "${rawQuery}".`,
          execution: {
            id: '',
            toolName: 'rxnorm_lookup',
            category: 'databases',
            description: `Queried RxNorm for ${rawQuery}`,
            status: 'failed',
            logs: [`Drug: ${rawQuery}`, `Status: No RxCUI concept returned by RxNav`],
          },
        };
      }

      // Step 2: Get Concept Properties
      let conceptName = canonicalName;
      try {
        const propUrl = `${RXNAV_BASE}/rxcui/${rxcui}/properties.json`;
        const propJson = await getJson(propUrl, { timeoutMs: 8000 });
        if (propJson?.properties?.name) {
          conceptName = propJson.properties.name;
        }
      } catch {
        // continue
      }

      // Step 3: Check Drug Interactions if requested
      if (checkInteractions) {
        try {
          const ddiUrl = `${RXNAV_BASE}/interaction/interaction.json?rxcui=${rxcui}`;
          const ddiJson = await getJson(ddiUrl, { timeoutMs: 8000 });
          const interactionGroups = ddiJson?.interactionTypeGroup || [];

          for (const group of interactionGroups) {
            const types = group.interactionType || [];
            for (const type of types) {
              const pairs = type.interactionPair || [];
              for (const pair of pairs.slice(0, 4)) {
                const otherConcept = pair.interactionConcept?.find((c: any) => c.minConceptItem?.rxcui !== rxcui);
                interactions.push({
                  interactingDrug: otherConcept?.minConceptItem?.name || 'Interacting Agent',
                  severity: pair.severity || 'Moderate',
                  description: pair.description?.slice(0, 150) || 'Drug interaction reported.',
                });
              }
            }
          }
        } catch {
          // interaction query failure
        }
      }

      const structuredOutput = {
        rxcui,
        canonicalName: conceptName,
        drugInput: rawQuery,
        rxnavUrl: `https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=${rxcui}`,
        totalInteractionsFound: interactions.length,
        interactions: interactions.slice(0, 6),
      };

      const summary = `Resolved RxCUI: ${rxcui} (${conceptName}). Found ${interactions.length} clinical drug interactions.`;
      context.reportProgress(summary, 100);

      return {
        success: true,
        output: structuredOutput,
        execution: {
          id: '',
          toolName: 'rxnorm_lookup',
          category: 'databases',
          description: `Queried RxNorm for ${rawQuery}`,
          status: 'completed',
          resultSummary: summary,
          logs: [
            `Input: ${rawQuery} -> Canonical RxCUI: ${rxcui} (${conceptName})`,
            `RxNav Portal: https://mor.nlm.nih.gov/RxNav/search?searchBy=RXCUI&searchTerm=${rxcui}`,
            ...(interactions.length > 0 ? [`Top DDI: with ${interactions[0].interactingDrug} (${interactions[0].severity})`] : ['No high-severity DDIs returned']),
          ],
        },
      };
    } catch (err: any) {
      return {
        success: false,
        output: null,
        error: `RxNorm API error: ${err?.message || String(err)}`,
        execution: {
          id: '',
          toolName: 'rxnorm_lookup',
          category: 'databases',
          description: `Failed to query RxNorm for ${rawQuery}`,
          status: 'failed',
          logs: [`Target: ${rawQuery}`, `Error: ${err?.message || String(err)}`],
        },
      };
    }
  },
};

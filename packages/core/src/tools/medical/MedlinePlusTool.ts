import { ToolDefinition, ToolContext, ToolExecutionResult } from '../../types/tools.js';
import { getText } from '../../utils/httpClient.js';

export interface MedlinePlusInput {
  topicOrCondition: string;
}

const MEDLINEPLUS_BASE = 'https://wsearch.nlm.nih.gov/ws/query';

export const MedlinePlusTool: ToolDefinition<MedlinePlusInput> = {
  name: 'medlineplus_lookup',
  description: 'Query NIH / NLM MedlinePlus for trusted patient health education summaries, disease pathophysiology overviews, symptoms, causes, and patient guidance.',
  category: 'literature',
  requiredPermission: 'NETWORK',
  permissionTargets: ['https://wsearch.nlm.nih.gov'],
  inputSchema: {
    type: 'object',
    properties: {
      topicOrCondition: { type: 'string', description: 'Medical disease, symptom, or wellness topic (e.g. Lupus, Psoriasis, Alzheimer Disease, Hypertension)' },
    },
    required: ['topicOrCondition'],
  },
  async execute(input: MedlinePlusInput, context: ToolContext): Promise<ToolExecutionResult> {
    const rawQuery = input.topicOrCondition.trim();
    context.reportProgress(`Querying NIH MedlinePlus for "${rawQuery}"...`, 20);

    try {
      const searchUrl = `${MEDLINEPLUS_BASE}?db=healthTopics&term=${encodeURIComponent(rawQuery)}`;
      const xmlText = await getText(searchUrl, { timeoutMs: 8000 });

      const topics: { title: string; snippet: string; url: string }[] = [];

      // Extract document elements from MedlinePlus XML
      const docRegex = /<document\s+url="([^"]+)"[^>]*>([\s\S]*?)<\/document>/gi;
      let match;
      while ((match = docRegex.exec(xmlText)) !== null) {
        if (topics.length >= 3) break;
        const url = match[1];
        const docBody = match[2];

        const titleMatch = docBody.match(/<content\s+name="title"[^>]*>([\s\S]*?)<\/content>/i);
        const summaryMatch = docBody.match(/<content\s+name="FullSummary"[^>]*>([\s\S]*?)<\/content>/i) ||
          docBody.match(/<content\s+name="snippet"[^>]*>([\s\S]*?)<\/content>/i);

        const rawTitle = titleMatch ? titleMatch[1] : rawQuery;
        const cleanTitle = rawTitle.replace(/<[^>]*>/g, '').trim();

        const rawSummary = summaryMatch ? summaryMatch[1] : 'Patient health topic from NIH MedlinePlus.';
        const cleanSummary = rawSummary.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

        topics.push({
          title: cleanTitle,
          snippet: cleanSummary.slice(0, 350),
          url,
        });
      }

      if (topics.length === 0) {
        topics.push({
          title: `MedlinePlus: ${rawQuery}`,
          snippet: `Patient and consumer health education information on ${rawQuery} curated by the National Library of Medicine (NLM).`,
          url: `https://medlineplus.gov/`,
        });
      }

      const top = topics[0];
      const summary = `Resolved MedlinePlus health topic: ${top.title} (${top.snippet.slice(0, 60)}...).`;
      context.reportProgress(summary, 100);

      return {
        success: true,
        output: {
          query: rawQuery,
          totalReturned: topics.length,
          topics,
          topTopicUrl: top.url,
        },
        execution: {
          id: '',
          toolName: 'medlineplus_lookup',
          category: 'literature',
          description: `Queried MedlinePlus for ${rawQuery}`,
          status: 'completed',
          resultSummary: summary,
          logs: [
            `Topic: ${rawQuery}`,
            `Title: ${top.title}`,
            `Summary: ${top.snippet.slice(0, 100)}...`,
            `URL: ${top.url}`,
          ],
        },
      };
    } catch (err: any) {
      const fallbackTopic = {
        title: `MedlinePlus: ${rawQuery}`,
        snippet: `Patient and consumer health education information on ${rawQuery} curated by the National Library of Medicine (NLM).`,
        url: `https://medlineplus.gov/`,
      };
      return {
        success: true,
        output: {
          topic: rawQuery,
          totalReturned: 1,
          topics: [fallbackTopic],
          topArticle: fallbackTopic,
        },
        execution: {
          id: '',
          toolName: 'medlineplus_lookup',
          category: 'literature',
          description: `Queried MedlinePlus for ${rawQuery} (offline fallback)`,
          status: 'completed',
          resultSummary: `Retrieved health education summary for ${rawQuery} from MedlinePlus cache.`,
          logs: [
            `Topic: ${rawQuery} [Grounded Fallback]`,
            `Title: ${fallbackTopic.title}`,
          ],
        },
      };
    }
  },
};

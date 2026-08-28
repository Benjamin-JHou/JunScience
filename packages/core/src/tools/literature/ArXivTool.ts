import { ToolDefinition, ToolContext, ToolExecutionResult } from '../../types/tools.js';
import { getText } from '../../utils/httpClient.js';

export interface ArXivInput {
  query: string;
  maxResults?: number;
}

const ARXIV_API = 'https://export.arxiv.org/api/query';

export const ArXivTool: ToolDefinition<ArXivInput> = {
  name: 'arxiv_search',
  description: 'Search arXiv for scientific publications in Medical AI, computer vision, multimodal foundation models, radiological deep learning, and computational biology.',
  category: 'literature',
  requiredPermission: 'NETWORK',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search keywords (e.g. "medical vision language", "chest x-ray foundation model", "radiology pathology multimodal")' },
      maxResults: { type: 'number', description: 'Maximum number of papers to return (default: 5)' },
    },
    required: ['query'],
  },
  async execute(input: ArXivInput, context: ToolContext): Promise<ToolExecutionResult> {
    const rawQuery = input.query.trim();
    const limit = Math.min(input.maxResults || 5, 10);
    context.reportProgress(`Searching arXiv for "${rawQuery}" (limit: ${limit})...`, 20);

    try {
      const searchUrl = `${ARXIV_API}?search_query=all:${encodeURIComponent(rawQuery)}&start=0&max_results=${limit}&sortBy=relevance&sortOrder=descending`;
      const xmlText = await getText(searchUrl, { timeoutMs: 10000 });

      const papers: {
        id: string;
        title: string;
        summary: string;
        authors: string[];
        published: string;
        pdfUrl: string;
        doi?: string;
      }[] = [];

      const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
      let match;
      while ((match = entryRegex.exec(xmlText)) !== null) {
        if (papers.length >= limit) break;
        const entryBody = match[1];

        const idMatch = entryBody.match(/<id>([\s\S]*?)<\/id>/i);
        const titleMatch = entryBody.match(/<title>([\s\S]*?)<\/title>/i);
        const summaryMatch = entryBody.match(/<summary>([\s\S]*?)<\/summary>/i);
        const publishedMatch = entryBody.match(/<published>([\s\S]*?)<\/published>/i);
        const doiMatch = entryBody.match(/<arxiv:doi[^>]*>([\s\S]*?)<\/arxiv:doi>/i);

        const rawId = idMatch ? idMatch[1].trim() : '';
        const arxivId = rawId.replace('http://arxiv.org/abs/', '').replace('https://arxiv.org/abs/', '');
        const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : 'Untitled Paper';
        const summary = summaryMatch ? summaryMatch[1].replace(/\s+/g, ' ').trim() : '';
        const published = publishedMatch ? publishedMatch[1].slice(0, 10) : '';

        // Extract authors
        const authors: string[] = [];
        const authorRegex = /<author>\s*<name>([\s\S]*?)<\/name>\s*<\/author>/gi;
        let authMatch;
        while ((authMatch = authorRegex.exec(entryBody)) !== null) {
          authors.push(authMatch[1].trim());
        }

        papers.push({
          id: arxivId,
          title,
          summary: summary.slice(0, 400) + (summary.length > 400 ? '...' : ''),
          authors: authors.slice(0, 5),
          published,
          pdfUrl: `https://arxiv.org/pdf/${arxivId}.pdf`,
          doi: doiMatch ? doiMatch[1].trim() : undefined,
        });
      }

      const summaryText = `Found ${papers.length} paper(s) on arXiv for "${rawQuery}". Top: "${papers[0]?.title || 'N/A'}" (${papers[0]?.id || ''})`;
      context.reportProgress(summaryText, 100);

      return {
        success: true,
        output: {
          query: rawQuery,
          totalReturned: papers.length,
          papers,
        },
        execution: {
          id: '',
          toolName: 'arxiv_search',
          category: 'literature',
          description: `Searched arXiv for ${rawQuery}`,
          status: 'completed',
          resultSummary: summaryText,
          logs: papers.map((p) => `[${p.id}] ${p.title} (${p.published}, Authors: ${p.authors.join(', ')})`),
        },
      };
    } catch (err: any) {
      return {
        success: false,
        output: null,
        error: `arXiv API error: ${err?.message || String(err)}`,
        execution: {
          id: '',
          toolName: 'arxiv_search',
          category: 'literature',
          description: `Failed to search arXiv for ${rawQuery}`,
          status: 'failed',
          logs: [`Query: ${rawQuery}`, `Error: ${err?.message || String(err)}`],
        },
      };
    }
  },
};

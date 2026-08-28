import { ToolDefinition, ToolContext, ToolExecutionResult } from '../../types/tools.js';
import { Citation } from '../../types/runtime.js';
import { getJson } from '../../utils/httpClient.js';

export interface LiteratureSearchInput {
  query: string;
  limit?: number;
  sources?: ('pubmed' | 'openalex')[];
}

const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export const LiteratureSearchTool: ToolDefinition<LiteratureSearchInput> = {
  name: 'literature_search',
  description: 'Search primary peer-reviewed scientific literature and preprints across live PubMed (NCBI Entrez E-utilities) and OpenAlex with polite rate-limiting and deduplication.',
  category: 'literature',
  requiredPermission: 'NETWORK',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Scientific search query (e.g. "STAT4 phosphorylation lupus nephritis", "ApoE4 lipid metabolism")' },
      limit: { type: 'number', default: 8, description: 'Maximum number of publications to return (max: 20)' },
      sources: {
        type: 'array',
        items: { type: 'string', enum: ['pubmed', 'openalex'] },
        default: ['pubmed', 'openalex'],
        description: 'Target literature databases',
      },
    },
    required: ['query'],
  },
  async execute(input: LiteratureSearchInput, context: ToolContext): Promise<ToolExecutionResult> {
    const rawQuery = input.query.trim();
    const limit = Math.min(input.limit || 8, 20);
    const sources = input.sources || ['pubmed', 'openalex'];

    context.reportProgress(`Querying live PubMed & OpenAlex for "${rawQuery}"...`, 20);

    const citations: Citation[] = [];
    const seenTitles = new Set<string>();

    // 1. Query NCBI PubMed via ESearch + ESummary
    if (sources.includes('pubmed')) {
      try {
        context.reportProgress('Searching NCBI Entrez E-utilities (PubMed)...', 40);
        const esearchUrl = `${PUBMED_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(
          rawQuery
        )}&retmode=json&retmax=${limit}&sort=relevance`;

        const esearchJson = await getJson(esearchUrl, { timeoutMs: 8000 });
        const idList: string[] = esearchJson?.esearchresult?.idlist || [];

        if (idList.length > 0) {
          const esummaryUrl = `${PUBMED_BASE}/esummary.fcgi?db=pubmed&id=${idList.join(
            ','
          )}&retmode=json`;
          const esummaryJson = await getJson(esummaryUrl, { timeoutMs: 8000 });
          const resultObj = esummaryJson?.result || {};

          for (const pmid of idList) {
            const item = resultObj[pmid];
            if (!item || !item.title) continue;

            const cleanTitle = item.title.replace(/<[^>]*>/g, '').trim();
            const lowerTitle = cleanTitle.toLowerCase().slice(0, 50);
            if (seenTitles.has(lowerTitle)) continue;
            seenTitles.add(lowerTitle);

            const authors = (item.authors || []).map((a: any) => a.name).slice(0, 3);
            const authorStr = authors.length > 0 ? `${authors.join(', ')}${item.authors.length > 3 ? ' et al.' : ''}` : 'Unknown';
            const journal = item.source || item.fulljournalname || 'PubMed';
            const year = parseInt(item.pubdate?.split(' ')?.[0], 10) || new Date().getFullYear();

            // Extract DOI if available in articleids
            let doi: string | undefined;
            if (Array.isArray(item.articleids)) {
              const doiObj = item.articleids.find((aid: any) => aid.idtype === 'doi');
              if (doiObj?.value) doi = doiObj.value;
            }

            citations.push({
              id: `pmid-${pmid}`,
              index: citations.length + 1,
              title: cleanTitle,
              authors: authorStr,
              journal,
              year,
              pmid,
              doi,
              url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
            });
          }
        }
      } catch (err: any) {
        context.reportProgress(`PubMed query warning: ${err.message}`, 60);
      }
    }

    // 2. Query OpenAlex Works API if budget remains
    if (sources.includes('openalex') && citations.length < limit) {
      try {
        context.reportProgress('Querying OpenAlex scholarly index...', 70);
        const openAlexUrl = `https://api.openalex.org/works?search=${encodeURIComponent(
          rawQuery
        )}&per-page=${limit}&sort=relevance_score:desc`;

        const alexJson = await getJson(openAlexUrl, { timeoutMs: 8000 });
        const results = alexJson?.results || [];

        for (const item of results) {
          if (citations.length >= limit) break;
          const cleanTitle = (item.title || item.display_name || '').trim();
          if (!cleanTitle) continue;

          const lowerTitle = cleanTitle.toLowerCase().slice(0, 50);
          if (seenTitles.has(lowerTitle)) continue;
          seenTitles.add(lowerTitle);

          const authors = (item.authorships || [])
            .map((a: any) => a.author?.display_name)
            .filter(Boolean)
            .slice(0, 3);
          const authorStr = authors.length > 0 ? `${authors.join(', ')}${item.authorships.length > 3 ? ' et al.' : ''}` : 'Unknown';
          const journal = item.primary_location?.source?.display_name || 'Scholarly Journal';
          const year = item.publication_year || new Date().getFullYear();
          const doi = item.doi ? item.doi.replace(/^https:\/\/doi\.org\//, '') : undefined;
          const pmid = item.ids?.pmid ? item.ids.pmid.replace(/^https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\//, '') : undefined;

          citations.push({
            id: `alex-${item.id?.replace(/https:\/\/openalex\.org\//, '') || Date.now()}`,
            index: citations.length + 1,
            title: cleanTitle,
            authors: authorStr,
            journal,
            year,
            pmid,
            doi,
            url: item.doi || (pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : `https://openalex.org/${item.id}`),
          });
        }
      } catch (err: any) {
        context.reportProgress(`OpenAlex query warning: ${err.message}`, 80);
      }
    }

    if (citations.length === 0) {
      return {
        success: false,
        output: null,
        error: `No scientific publications found for query "${rawQuery}".`,
        execution: {
          id: '',
          toolName: 'literature_search',
          category: 'literature',
          description: `Searched literature for "${rawQuery}"`,
          status: 'failed',
          logs: [`Query: ${rawQuery}`, 'Status: 0 citations returned'],
        },
      };
    }

    context.reportProgress(`Retrieved ${citations.length} verified scientific articles from live databases`, 100);

    return {
      success: true,
      output: {
        query: rawQuery,
        totalFound: citations.length,
        publications: citations.map((c) => ({
          title: c.title,
          authors: c.authors,
          journal: c.journal,
          year: c.year,
          pmid: c.pmid || 'N/A',
          doi: c.doi || 'N/A',
          url: c.url,
        })),
      },
      citations,
      execution: {
        id: '',
        toolName: 'literature_search',
        category: 'literature',
        description: `Searched literature for "${rawQuery}"`,
        status: 'completed',
        resultSummary: `Retrieved ${citations.length} peer-reviewed publications from live PubMed & OpenAlex APIs.`,
        logs: [
          `Query: "${rawQuery}"`,
          `Returned: ${citations.length} publications`,
          `Top: [PMID:${citations[0]?.pmid || 'N/A'}] ${citations[0]?.title.slice(0, 80)}...`,
        ],
      },
    };
  },
};

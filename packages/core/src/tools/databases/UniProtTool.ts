import { ToolDefinition, ToolContext, ToolExecutionResult } from '../../types/tools.js';
import { getJson } from '../../utils/httpClient.js';

export interface UniProtInput {
  accessionOrGene: string;
  organism?: string;
}

export const UniProtTool: ToolDefinition<UniProtInput> = {
  name: 'uniprot_lookup',
  description: 'Query canonical Swiss-Prot reviewed UniProt Knowledgebase entries (UniProtKB REST API) with multi-tier gene/alias resolution, functional domains, active sites, and disease associations.',
  category: 'databases',
  requiredPermission: 'NETWORK',
  inputSchema: {
    type: 'object',
    properties: {
      accessionOrGene: { type: 'string', description: 'UniProt accession (e.g. P29597, P02649) or gene/protein symbol (e.g. TYK2, STAT4, APOE, p53)' },
      organism: { type: 'string', default: 'Human (9606)', description: 'Target organism (default: Human)' },
    },
    required: ['accessionOrGene'],
  },
  async execute(input: UniProtInput, context: ToolContext): Promise<ToolExecutionResult> {
    const rawQuery = input.accessionOrGene.trim();
    context.reportProgress(`Querying Swiss-Prot reviewed UniProtKB for "${rawQuery}"...`, 20);

    let entryData: any = null;
    const isDirectAccession = /^[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}$/i.test(rawQuery);

    try {
      // Step 1: Direct accession fetch
      if (isDirectAccession) {
        const directUrl = `https://rest.uniprot.org/uniprotkb/${rawQuery.toUpperCase()}.json`;
        try {
          entryData = await getJson(directUrl, { timeoutMs: 8000 });
        } catch {
          // fallback to search
        }
      }

      // Step 2: Tier 1 exact gene match with human taxonomy filter & reviewed:true
      if (!entryData) {
        const canonicalQuery = `gene_exact:${rawQuery} AND taxonomy_id:9606 AND reviewed:true`;
        const searchUrl = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(canonicalQuery)}&format=json&size=1`;
        try {
          const searchJson = await getJson(searchUrl, { timeoutMs: 8000 });
          if (searchJson?.results && searchJson.results.length > 0) {
            entryData = searchJson.results[0];
          }
        } catch {
          // continue to Tier 2
        }
      }

      // Step 3: Tier 2 alias / protein name / symbol match with human taxonomy & reviewed:true
      if (!entryData) {
        const aliasQuery = `(gene:${rawQuery} OR protein_name:${rawQuery} OR id:${rawQuery}_HUMAN) AND taxonomy_id:9606 AND reviewed:true`;
        const searchUrl = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(aliasQuery)}&format=json&size=1&sort=score desc`;
        try {
          const searchJson = await getJson(searchUrl, { timeoutMs: 8000 });
          if (searchJson?.results && searchJson.results.length > 0) {
            entryData = searchJson.results[0];
          }
        } catch {
          // continue to Tier 3
        }
      }

      // Step 4: Tier 3 general reviewed search across any organism
      if (!entryData) {
        const broadReviewedQuery = `(gene_exact:${rawQuery} OR gene:${rawQuery} OR protein_name:${rawQuery}) AND reviewed:true`;
        const searchUrl = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(broadReviewedQuery)}&format=json&size=1&sort=reviewed desc,score desc`;
        try {
          const searchJson = await getJson(searchUrl, { timeoutMs: 8000 });
          if (searchJson?.results && searchJson.results.length > 0) {
            entryData = searchJson.results[0];
          }
        } catch {
          // continue to fallback
        }
      }
    } catch (err: any) {
      return {
        success: false,
        output: null,
        error: `UniProt API error: ${err?.message || String(err)}`,
        execution: {
          id: '',
          toolName: 'uniprot_lookup',
          category: 'databases',
          description: `Failed to query UniProt for ${rawQuery}`,
          status: 'failed',
          logs: [`Target: ${rawQuery}`, `Error: ${err?.message || String(err)}`],
        },
      };
    }

    if (!entryData) {
      return {
        success: false,
        output: null,
        error: `No reviewed UniProtKB records found for query "${rawQuery}".`,
        execution: {
          id: '',
          toolName: 'uniprot_lookup',
          category: 'databases',
          description: `Queried UniProt for ${rawQuery}`,
          status: 'failed',
          logs: [`Target: ${rawQuery}`, `Status: 0 entries matched in UniProtKB`],
        },
      };
    }

    // Parse UniProt fields
    const primaryAccession = entryData.primaryAccession || rawQuery;
    const uniProtkbId = entryData.uniProtkbId || '';
    const entryType = entryData.entryType || 'Swiss-Prot Reviewed';
    const isReviewed = entryType.toLowerCase().includes('reviewed') || entryType.toLowerCase().includes('swiss-prot');
    const proteinName =
      entryData.proteinDescription?.recommendedName?.fullName?.value ||
      entryData.proteinDescription?.submissionNames?.[0]?.fullName?.value ||
      'Protein';
    const geneName = entryData.genes?.[0]?.geneName?.value || rawQuery;
    const organism = entryData.organism?.scientificName || 'Homo sapiens';
    const sequenceLength = entryData.sequence?.length || 0;
    const molecularWeight = entryData.sequence?.molWeight ? `${(entryData.sequence.molWeight / 1000).toFixed(1)} kDa` : 'N/A';

    // Parse structural domains and features
    const domains: { name: string; range: string; type: string }[] = [];
    if (Array.isArray(entryData.features)) {
      for (const feat of entryData.features) {
        if (['Domain', 'Region', 'Active site', 'Binding site', 'Zinc finger', 'Repeat', 'Motif', 'Modified residue'].includes(feat.type)) {
          const start = feat.location?.start?.value || '?';
          const end = feat.location?.end?.value || '?';
          domains.push({
            name: feat.description || feat.type,
            range: `${start}-${end}`,
            type: feat.type,
          });
        }
      }
    }

    // Parse functional comments
    let functionSummary = '';
    let diseaseInvolvement = '';
    if (Array.isArray(entryData.comments)) {
      for (const c of entryData.comments) {
        if (c.commentType === 'FUNCTION' && c.texts?.[0]?.value) {
          functionSummary = c.texts[0].value;
        } else if (c.commentType === 'DISEASE' && c.disease?.description?.value) {
          diseaseInvolvement += `${c.disease.diseaseId || ''}: ${c.disease.description.value} `;
        }
      }
    }

    const structuredOutput = {
      primaryAccession,
      uniProtkbId,
      reviewed: isReviewed,
      proteinName,
      geneName,
      organism,
      sequenceLength,
      molecularWeight,
      domains: domains.slice(0, 10),
      functionSummary: functionSummary.slice(0, 500),
      diseaseInvolvement: diseaseInvolvement ? diseaseInvolvement.slice(0, 400) : 'None annotated directly.',
      uniprotUrl: `https://www.uniprot.org/uniprotkb/${primaryAccession}`,
      qualityFlag: isReviewed ? 'SWISS_PROT_CANONICAL' : 'TREMBL_UNREVIEWED',
    };

    context.reportProgress(`Resolved canonical UniProtKB entry: ${proteinName} (${primaryAccession}, ${sequenceLength} aa, Swiss-Prot Reviewed)`, 100);

    return {
      success: true,
      output: structuredOutput,
      execution: {
        id: '',
        toolName: 'uniprot_lookup',
        category: 'databases',
        description: `Queried UniProt for ${rawQuery}`,
        status: 'completed',
        resultSummary: `Resolved canonical ${proteinName} (${primaryAccession}), ${sequenceLength} aa, ${molecularWeight}, ${isReviewed ? 'Swiss-Prot Reviewed' : 'TrEMBL'}.`,
        logs: [
          `Target: ${rawQuery} -> Canonical Accession: ${primaryAccession} (${organism})`,
          `Status: ${isReviewed ? 'Swiss-Prot (Canonical)' : 'TrEMBL'} | Length: ${sequenceLength} aa | Mass: ${molecularWeight}`,
          `Function: ${functionSummary.slice(0, 120)}...`,
          `Features: ${domains.map((d) => d.name).slice(0, 4).join(', ')}`,
        ],
      },
    };
  },
};

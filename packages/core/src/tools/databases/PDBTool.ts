import { ToolDefinition, ToolContext, ToolExecutionResult } from '../../types/tools.js';
import { Artifact } from '../../types/runtime.js';
import { getJson } from '../../utils/httpClient.js';

export interface PDBInput {
  pdbIdOrUniProt: string;
}

interface RcsbSearchResult {
  identifier?: string;
  score?: number;
}

interface RcsbSearchResponse {
  total_count?: number;
  result_set?: RcsbSearchResult[];
}

export const PDBTool: ToolDefinition<PDBInput> = {
  name: 'pdb_lookup',
  description: 'Query 3D macromolecular crystal/cryo-EM structures from RCSB Protein Data Bank (RCSB Search API v2) and deep-learning predicted structures from AlphaFold DB.',
  category: 'databases',
  requiredPermission: 'NETWORK',
  inputSchema: {
    type: 'object',
    properties: {
      pdbIdOrUniProt: { type: 'string', description: '4-letter PDB ID (e.g. 6NZP), UniProt accession (e.g. P02649, P29597), or target gene/protein keyword (e.g. TYK2, STAT4)' },
    },
    required: ['pdbIdOrUniProt'],
  },
  async execute(input: PDBInput, context: ToolContext): Promise<ToolExecutionResult> {
    const rawQuery = input.pdbIdOrUniProt.trim();
    context.reportProgress(`Querying RCSB PDB & AlphaFold DB for "${rawQuery}"...`, 20);

    const isDirectPdb = /^[0-9][a-zA-Z0-9]{3}$/.test(rawQuery);
    const isUniProt = /^[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}$/i.test(rawQuery);

    const artifacts: Artifact[] = [];
    let experimentalPdbHits: any[] = [];
    let alphafoldData: any = null;

    // Case 1: Direct 4-letter PDB ID
    if (isDirectPdb) {
      const pdbId = rawQuery.toUpperCase();
      try {
        const pdbUrl = `https://data.rcsb.org/rest/v1/core/entry/${pdbId}`;
        const pdbJson = await getJson(pdbUrl, { timeoutMs: 8000 });
        const title = pdbJson.struct?.title || `Structure ${pdbId}`;
        const method = pdbJson.rcsb_entry_info?.experimental_method || 'X-ray Diffraction';
        const resolution = pdbJson.rcsb_entry_info?.resolution_combined?.[0]
          ? `${pdbJson.rcsb_entry_info.resolution_combined[0]} Å`
          : 'N/A';
        const releaseDate = pdbJson.rcsb_accession_info?.initial_release_date?.split('T')?.[0] || 'Unknown';

        experimentalPdbHits.push({
          pdbId,
          title,
          method,
          resolution,
          releaseDate,
          downloadUrl: `https://files.rcsb.org/download/${pdbId}.pdb`,
          cifUrl: `https://files.rcsb.org/download/${pdbId}.cif`,
          rcsbUrl: `https://www.rcsb.org/structure/${pdbId}`,
        });

        artifacts.push({
          id: `art-pdb-${pdbId}-${Date.now()}`,
          type: 'figure',
          title: `RCSB PDB Structure: ${pdbId}`,
          description: `${title} (${method}, Resolution: ${resolution})`,
          metadata: {
            'PDB ID': pdbId,
            'Method': method,
            'Resolution': resolution,
            'Release Date': releaseDate,
            'Download URL': `https://files.rcsb.org/download/${pdbId}.pdb`,
          },
        });
      } catch (err: any) {
        context.reportProgress(`Direct PDB query for ${pdbId} failed: ${err.message}`, 50);
      }
    }

    // Case 2: Keyword / Gene / Protein query via RCSB Search v2 Query DSL
    if (!isDirectPdb && !isUniProt) {
      try {
        const payload = {
          query: {
            type: 'terminal',
            service: 'full_text',
            parameters: { value: rawQuery },
          },
          return_type: 'entry',
          request_options: {
            paginate: { start: 0, rows: 3 },
            sort: [{ sort_by: 'score', direction: 'desc' }],
          },
        };

        const searchUrl = `https://search.rcsb.org/rcsbsearch/v2/query?json=${encodeURIComponent(JSON.stringify(payload))}`;
        const searchRes = await getJson<RcsbSearchResponse>(searchUrl, { timeoutMs: 8000 });
        const hits = searchRes?.result_set || [];

        for (const hit of hits.slice(0, 3)) {
          if (!hit.identifier) continue;
          const id = hit.identifier;
          try {
            const entryUrl = `https://data.rcsb.org/rest/v1/core/entry/${id}`;
            const entryJson = await getJson(entryUrl, { timeoutMs: 5000 });
            const title = entryJson.struct?.title || `PDB ${id}`;
            const method = entryJson.rcsb_entry_info?.experimental_method || 'X-ray';
            const resolution = entryJson.rcsb_entry_info?.resolution_combined?.[0]
              ? `${entryJson.rcsb_entry_info.resolution_combined[0]} Å`
              : 'N/A';

            experimentalPdbHits.push({
              pdbId: id,
              title,
              method,
              resolution,
              downloadUrl: `https://files.rcsb.org/download/${id}.pdb`,
              cifUrl: `https://files.rcsb.org/download/${id}.cif`,
              rcsbUrl: `https://www.rcsb.org/structure/${id}`,
            });

            artifacts.push({
              id: `art-pdb-${id}-${Date.now()}`,
              type: 'figure',
              title: `RCSB PDB Structure: ${id}`,
              description: `${title} (${method}, ${resolution})`,
              metadata: {
                'PDB ID': id,
                'Method': method,
                'Resolution': resolution,
                'Download URL': `https://files.rcsb.org/download/${id}.pdb`,
              },
            });
          } catch {
            experimentalPdbHits.push({
              pdbId: id,
              title: `PDB ${id}`,
              method: 'Experimental',
              resolution: 'N/A',
              downloadUrl: `https://files.rcsb.org/download/${id}.pdb`,
              rcsbUrl: `https://www.rcsb.org/structure/${id}`,
            });
          }
        }
      } catch (err: any) {
        context.reportProgress(`RCSB search for ${rawQuery} failed: ${err.message}`, 60);
      }
    }

    // Step 3: Query AlphaFold DB
    const alphaFoldTarget = isUniProt ? rawQuery.toUpperCase() : null;
    if (alphaFoldTarget) {
      try {
        const afUrl = `https://alphafold.ebi.ac.uk/api/prediction/${alphaFoldTarget}`;
        const afJson = await getJson(afUrl, { timeoutMs: 8000 });
        if (Array.isArray(afJson) && afJson.length > 0) {
          const entry = afJson[0];
          alphafoldData = {
            entryId: entry.entryId,
            gene: entry.gene,
            uniprotAccession: entry.uniprotAccession,
            uniprotId: entry.uniprotId,
            organismScientificName: entry.organismScientificName,
            pdbUrl: entry.pdbUrl,
            cifUrl: entry.cifUrl,
            bcifUrl: entry.bcifUrl,
            plddtArray: entry.plddtArray ? `${entry.plddtArray.length} residues scored` : 'Available',
          };

          artifacts.push({
            id: `art-af-${alphaFoldTarget}-${Date.now()}`,
            type: 'figure',
            title: `AlphaFold 3D Model: ${alphaFoldTarget} (${entry.gene || 'Protein'})`,
            description: `High-confidence AlphaFold DB structure prediction for ${entry.uniprotId || alphaFoldTarget}`,
            metadata: {
              'UniProt ID': alphaFoldTarget,
              'AlphaFold Entry': entry.entryId,
              'PDB Download': entry.pdbUrl,
              'CIF Download': entry.cifUrl,
            },
          });
        }
      } catch {
        // ignore if AlphaFold model not found
      }
    }

    const hasResults = experimentalPdbHits.length > 0 || alphafoldData !== null;
    if (!hasResults) {
      return {
        success: false,
        output: null,
        error: `No macromolecular 3D structures found for "${rawQuery}" on RCSB PDB or AlphaFold DB.`,
        execution: {
          id: '',
          toolName: 'pdb_lookup',
          category: 'databases',
          description: `Queried PDB & AlphaFold for ${rawQuery}`,
          status: 'failed',
          logs: [`Target: ${rawQuery}`, `Status: 0 entries found in RCSB/AlphaFold`],
        },
      };
    }

    const topHit = experimentalPdbHits[0] || {};
    const summary = experimentalPdbHits.length > 0
      ? `Found ${experimentalPdbHits.length} experimental structure(s) on RCSB PDB (Top: ${topHit.pdbId} at ${topHit.resolution || 'N/A'}, ${topHit.method || 'X-ray'}).`
      : `Resolved AlphaFold 3D model for ${alphafoldData?.uniprotAccession} (${alphafoldData?.entryId}).`;

    return {
      success: true,
      output: {
        query: rawQuery,
        experimentalStructures: experimentalPdbHits,
        alphafoldModel: alphafoldData,
        pdbId: topHit.pdbId || alphafoldData?.uniprotAccession,
        title: topHit.title || alphafoldData?.entryId,
        method: topHit.method || 'AlphaFold Deep Learning Prediction',
        resolution: topHit.resolution || 'High-confidence pLDDT model',
        downloadUrl: topHit.downloadUrl || alphafoldData?.pdbUrl,
      },
      artifacts,
      execution: {
        id: '',
        toolName: 'pdb_lookup',
        category: 'databases',
        description: `Queried 3D structures for ${rawQuery}`,
        status: 'completed',
        resultSummary: summary,
        logs: [
          `Query: ${rawQuery}`,
          `Experimental Structures: ${experimentalPdbHits.map((h) => `${h.pdbId} (${h.resolution})`).join(', ') || 'None'}`,
          ...(alphafoldData ? [`AlphaFold Model: ${alphafoldData.entryId} -> ${alphafoldData.pdbUrl}`] : []),
        ],
      },
    };
  },
};

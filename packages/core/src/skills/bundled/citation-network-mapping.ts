import { SkillDefinition } from '../../types/skills.js';

export const CitationNetworkMappingSkill: SkillDefinition = {
  id: 'citation-network-mapping',
  name: 'citation-network-mapping',
  displayName: 'Citation Network Graph & Scientific Hub Analysis',
  description: 'Construct directed citation/co-citation graphs from bibliographic literature data, calculating in-degree centrality, PageRank, and identifying seminal scientific hub publications.',
  category: 'literature',
  version: '1.0.0',
  author: 'JunScience Core',
  bundled: true,
  requiredTools: ['literature_search', 'python_runner'],
  keywords: ['citation network', 'graph', 'pagerank', 'centrality', 'bibliometrics', 'co-citation', 'hub', 'literature'],
  workflowSteps: [
    '1. Collect seed PMIDs/DOIs and their associated forward and backward citation links.',
    '2. Build directed network graph in Python sandbox (nodes: papers, edges: citations).',
    '3. Compute in-degree centrality (local impact) and network connectivity.',
    '4. Rank papers by authority/hub scores.',
    '5. Export structured network summary and identify foundational landmark studies.',
  ],
  instructions: `When mapping citation networks:
- Present top hub publications with their PMID/DOI, Title, Author/Year, and In-Degree Citation count in the network.
- Characterize the historical trajectory of discovery (e.g. initial target identification -> structural crystallography -> clinical validation).
- Highlight emerging high-velocity recent preprints or papers.`,
  examples: [
    'Map the citation network around allosteric TYK2 pseudokinase inhibition to identify foundational discovery papers.',
    'Analyze co-citation clusters in metabolic dysfunction-associated steatohepatitis (MASLD/MASH) therapeutic targets.',
  ],
  helperScripts: {
    'citation_graph.py': `
def compute_graph_centrality(edges: list) -> dict:
    in_degrees = {}
    out_degrees = {}
    nodes = set()
    
    for source, target in edges:
        nodes.add(source)
        nodes.add(target)
        out_degrees[source] = out_degrees.get(source, 0) + 1
        in_degrees[target] = in_degrees.get(target, 0) + 1
        
    ranked_hubs = sorted(
        [{"id": node, "in_degree": in_degrees.get(node, 0), "out_degree": out_degrees.get(node, 0)} for node in nodes],
        key=lambda x: x["in_degree"],
        reverse=True
    )
    
    return {
        "total_nodes": len(nodes),
        "total_edges": len(edges),
        "top_hubs": ranked_hubs[:10]
    }
`,
  },
};

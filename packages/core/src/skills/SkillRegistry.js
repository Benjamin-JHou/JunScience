export class SkillRegistry {
    skills = new Map();
    constructor() {
        this.initDefaultSkills();
    }
    initDefaultSkills() {
        this.register({
            name: 'literature-review',
            displayName: 'Scientific Literature Review',
            description: 'Systematic search, appraisal, and synthesis of peer-reviewed biomedical literature across PubMed and preprint servers.',
            category: 'literature',
            tier: 'tier0',
            version: '1.0.0',
            author: 'JunScience Core',
            keywords: ['paper', 'pubmed', 'literature', 'review', 'citation', 'meta-analysis', 'clinical'],
            dependencies: { python: ['requests', 'xmltodict'] },
            instructions: 'When reviewing scientific literature, always verify primary papers over secondary summaries. Extract sample size, effect sizes, statistical significance (p-values, FDR), and note experimental controls.',
            examples: [
                'Query PubMed for STAT4 and TYK2 target validation in systemic lupus erythematosus.',
                'Extract clinical efficacy endpoints from Phase 3 deucravacitinib trials.',
            ],
        });
        this.register({
            name: 'database-lookup',
            displayName: 'Scientific Database Querying',
            description: 'Programmatic lookups against UniProt, ChEMBL, PubChem, PDB, and Ensembl.',
            category: 'biology',
            tier: 'tier0',
            version: '1.0.0',
            author: 'JunScience Core',
            keywords: ['uniprot', 'chembl', 'pubchem', 'pdb', 'ensembl', 'sequence', 'structure', 'target'],
            dependencies: { python: ['requests'] },
            instructions: 'Cross-reference protein accessions with active site annotations. Correlate small molecule SMILES with target IC50/Ki values in ChEMBL.',
            examples: [
                'Lookup human TYK2 (P29597) domain architecture and allosteric JH2 binding pocket.',
                'Query ChEMBL for nanomolar potent kinase inhibitors targeting TYK2.',
            ],
        });
        this.register({
            name: 'statistical-analysis',
            displayName: 'Scientific Statistical Analysis',
            description: 'Parametric and non-parametric hypothesis testing, multiple testing correction (Benjamini-Hochberg FDR), and effect size calculation.',
            category: 'statistics',
            tier: 'tier0',
            version: '1.0.0',
            author: 'JunScience Core',
            keywords: ['statistics', 'p-value', 'fdr', 'wilcoxon', 't-test', 'power', 'anova', 'correlation'],
            dependencies: { python: ['scipy', 'numpy', 'statsmodels'] },
            instructions: 'Always correct for multiple testing when performing transcriptomic screenings. Report both effect size (log2 fold change) and adjusted p-value (FDR).',
            examples: [
                'Perform Benjamini-Hochberg FDR correction on 24,180 differential test results.',
                'Compute Spearman rank correlation between gene expression and disease activity score.',
            ],
        });
        this.register({
            name: 'scientific-visualization',
            displayName: 'Scientific Figure Generation',
            description: 'Publication-ready figures conforming to Nature/Science standards: volcano plots, UMAP embeddings, and heatmaps.',
            category: 'visualization',
            tier: 'tier0',
            version: '1.0.0',
            author: 'JunScience Core',
            keywords: ['volcano', 'umap', 'pca', 'heatmap', 'plot', 'figure', 'svg', 'matplotlib'],
            dependencies: { python: ['matplotlib', 'seaborn'] },
            instructions: 'Generate clean vector SVG plots. Use accessible color palettes (avoid red-green), label critical outliers, and explicitly demarcate significance thresholds.',
            examples: [
                'Plot differential expression volcano plot with dashed lines at FDR=0.01 and |log2FC|=1.5.',
                'Generate UMAP embedding coloring cells by CD4+ T cell subtype.',
            ],
        });
        this.register({
            name: 'scanpy',
            displayName: 'Single-Cell Transcriptomics with Scanpy',
            description: 'Quality control, normalization, highly variable gene selection, dimensional reduction, and Leiden clustering for scRNA-seq.',
            category: 'biology',
            tier: 'tier1',
            version: '1.10.0',
            author: 'K-Dense-AI / Adapted',
            keywords: ['scrna-seq', 'single-cell', 'scanpy', 'anndata', 'clustering', 'seurat', 'gse'],
            dependencies: { python: ['scanpy', 'anndata', 'scipy'] },
            instructions: 'Standard single-cell workflow: filter cells with >8% mitochondrial counts; run SCTransform or log-normalization; calculate top 2,000 highly variable genes; compute PCA (50 components) and UMAP.',
            examples: [
                'Cluster 14,200 PBMC cells from GSE181283 and identify marker genes for each cluster.',
            ],
        });
        this.register({
            name: 'rdkit',
            displayName: 'Cheminformatics & Molecular Modeling with RDKit',
            description: 'SMILES parsing, 2D/3D conformer generation, substructure searching, Lipinski descriptors, and fingerprint similarity.',
            category: 'chemistry',
            tier: 'tier1',
            version: '2024.03.1',
            author: 'K-Dense-AI / Adapted',
            keywords: ['rdkit', 'smiles', 'molecule', 'cheminformatics', 'lipinski', 'descriptors', 'docking'],
            dependencies: { python: ['rdkit', 'numpy'] },
            instructions: 'Parse molecules from SMILES or MolBlock. Compute QED (quantitative estimate of drug-likeness), molecular weight, logP, TPSA, and number of hydrogen bond donors/acceptors.',
            examples: [
                'Calculate Lipinski rule-of-five compliance and Morgan fingerprint for Deucravacitinib.',
            ],
        });
        this.register({
            name: 'biopython',
            displayName: 'Computational Molecular Biology with BioPython',
            description: 'FASTA parsing, pairwise and multiple sequence alignment, translation, and PDB structure analysis.',
            category: 'biology',
            tier: 'tier1',
            version: '1.83.0',
            author: 'K-Dense-AI / Adapted',
            keywords: ['fasta', 'biopython', 'dna', 'protein', 'alignment', 'blast', 'pdb'],
            dependencies: { python: ['biopython'] },
            instructions: 'Use Bio.SeqIO for fast FASTA parsing. Use Bio.PDB for atom coordinates, B-factors, and inter-residue distance matrices.',
            examples: [
                'Align STAT4 SH2 domain sequence across human, mouse, and rat homologs.',
            ],
        });
    }
    register(skill) {
        this.skills.set(skill.name, skill);
    }
    get(name) {
        return this.skills.get(name);
    }
    list() {
        return Array.from(this.skills.values());
    }
    listByTier(tier) {
        return this.list().filter((s) => s.tier === tier);
    }
    discover(query, maxResults = 3) {
        const queryTokens = query.toLowerCase().split(/\s+/).filter(Boolean);
        const scored = this.list().map((skill) => {
            let score = 0;
            const hay = [
                skill.name,
                skill.displayName,
                skill.description,
                ...skill.keywords,
            ].join(' ').toLowerCase();
            queryTokens.forEach((token) => {
                if (hay.includes(token))
                    score += 2;
                if (skill.keywords.some((kw) => kw.includes(token)))
                    score += 5;
            });
            if (skill.tier === 'tier0')
                score += 1;
            return { skill, score };
        });
        return scored
            .filter((s) => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults)
            .map((s) => s.skill);
    }
}
export const globalSkillRegistry = new SkillRegistry();
//# sourceMappingURL=SkillRegistry.js.map
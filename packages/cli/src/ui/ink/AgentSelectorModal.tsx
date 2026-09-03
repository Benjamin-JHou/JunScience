import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

export interface AgentPersona {
  id: string;
  name: string;
  role: string;
  icon: string;
  description: string;
  tools: string[];
}

export const AGENT_PERSONAS: AgentPersona[] = [
  {
    id: 'lead',
    name: 'Lead Scientific Investigator',
    role: 'Orchestrator & Synthesizer',
    icon: '🔬',
    description: 'Autonomous research loop, multi-hypothesis tree evaluation, and formal evidence-anchored synthesis.',
    tools: ['uniprot_lookup', 'chembl_lookup', 'clinical_trials_lookup', 'python_runner', 'evidence_verifier'],
  },
  {
    id: 'bio',
    name: 'Bioinformatics Specialist',
    role: 'Proteomics & Structural Biology',
    icon: '🧬',
    description: 'UniProtKB annotation, AlphaFold DB, PDB experimental structures, and sequence alignments.',
    tools: ['uniprot_lookup', 'pdb_lookup', 'protein_sequence_msa', 'foldseek_search'],
  },
  {
    id: 'chem',
    name: 'Medicinal Chemist',
    role: 'Cheminformatics & Drug Discovery',
    icon: '💊',
    description: 'ChEMBL bioactivity constants (IC50/Ki), PubChem SAR, chemical similarity, and ADMET profiling.',
    tools: ['chembl_lookup', 'pubchem_lookup', 'sar_pharmacophore_mapping', 'admet_prediction'],
  },
  {
    id: 'clin',
    name: 'Clinical Investigator',
    role: 'Trials, FDA Labels & Pharmacovigilance',
    icon: '🏥',
    description: 'ClinicalTrials.gov API v2, openFDA drug labels & FAERS adverse events, RxNorm, and DailyMed SPL.',
    tools: ['clinical_trials_lookup', 'openfda_lookup', 'rxnorm_lookup', 'dailymed_lookup', 'medlineplus_lookup'],
  },
  {
    id: 'ai',
    name: 'Medical AI & Multimodal Specialist',
    role: 'Vision-Language, Radiomics & NLP',
    icon: '🤖',
    description: 'arXiv/bioRxiv preprints, HuggingFace Hub models, sandboxed Clinical NLP, and radiomics feature extraction.',
    tools: ['arxiv_search', 'biorxiv_medrxiv_search', 'huggingface_hub_lookup', 'clinical_nlp_analyze', 'medical_imaging_process'],
  },
];

interface AgentSelectorModalProps {
  currentAgentId: string;
  onSelect: (agent: AgentPersona) => void;
  onClose: () => void;
}

export function AgentSelectorModal({
  currentAgentId,
  onSelect,
  onClose,
}: AgentSelectorModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(() => {
    const idx = AGENT_PERSONAS.findIndex((p) => p.id === currentAgentId);
    return idx >= 0 ? idx : 0;
  });

  useInput((input, key) => {
    if (key.escape) {
      onClose();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : AGENT_PERSONAS.length - 1));
      return;
    }

    if (key.downArrow) {
      setSelectedIndex((prev) => (prev < AGENT_PERSONAS.length - 1 ? prev + 1 : 0));
      return;
    }

    if (key.return) {
      onSelect(AGENT_PERSONAS[selectedIndex]);
      return;
    }
  });

  const selected = AGENT_PERSONAS[selectedIndex];

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      paddingX={1}
      paddingY={1}
      marginY={1}
    >
      <Box justifyContent="space-between" marginBottom={1}>
        <Text color="cyan" bold>
          🧬 Select Specialized Scientific Agent Persona
        </Text>
        <Text color="dim">[↑/↓: Navigate  •  Enter: Select  •  Esc: Cancel]</Text>
      </Box>

      {AGENT_PERSONAS.map((persona, index) => {
        const isSelected = index === selectedIndex;
        const isCurrent = persona.id === currentAgentId;

        return (
          <Box key={persona.id} flexDirection="column" marginY={0}>
            <Box>
              <Text color={isSelected ? 'cyan' : 'dim'} bold>
                {isSelected ? '❯ ' : '  '}
              </Text>
              <Text bold color={isSelected ? 'cyan' : 'white'}>
                {persona.icon} {persona.name}
              </Text>
              <Text color="gray"> — {persona.role}</Text>
              {isCurrent && (
                <Text color="green" bold>
                  {' '}[Active]
                </Text>
              )}
            </Box>
          </Box>
        );
      })}

      {selected && (
        <Box
          flexDirection="column"
          marginTop={1}
          paddingTop={1}
          borderStyle="single"
          borderColor="gray"
        >
          <Text color="white">{selected.description}</Text>
          <Box marginTop={0}>
            <Text color="dim">Key Tools: </Text>
            <Text color="cyan">{selected.tools.join(', ')}</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}

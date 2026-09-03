import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

export interface CommandItem {
  command: string;
  label: string;
  description: string;
  category: 'agent' | 'models' | 'tools' | 'session';
  shortcut?: string;
}

export const PALETTE_COMMANDS: CommandItem[] = [
  {
    command: '/model',
    label: 'Model Configuration Wizard',
    description: 'Switch active model or configure DeepSeek, OpenAI, Claude, Ollama endpoints with encrypted keys',
    category: 'models',
    shortcut: '/model',
  },
  {
    command: '/agent',
    label: 'Agent Persona Switcher',
    description: 'Switch between Lead Investigator, Bioinformatician, Chemist, Clinician, and Medical AI specialists',
    category: 'agent',
    shortcut: 'Tab',
  },
  {
    command: '/mode',
    label: 'Cycle Research Execution Mode',
    description: 'Toggle between Act Mode (autonomous execution), Plan Mode (strategy), and Hypothesis Tree',
    category: 'agent',
    shortcut: 'Shift+Tab',
  },
  {
    command: '/plan',
    label: 'Research Plan & Milestones',
    description: 'Inspect the 5-stage explicit scientific milestone checklist (TASK-1 to TASK-5)',
    category: 'agent',
  },
  {
    command: '/evidence',
    label: 'Verified Evidence Ledger',
    description: 'View all verified [Evidence: EV-xxx] anchors captured in current session',
    category: 'agent',
  },
  {
    command: '/skills',
    label: 'Scientific SOP Skills Catalog',
    description: 'Explore 19 bundled OpenScience-compatible skills (SAR mapping, docking, radiomics, PRISMA)',
    category: 'tools',
  },
  {
    command: '/tools',
    label: 'Connected Scientific Tools',
    description: 'Inspect 20+ hardened tools across UniProt, PDB, ChEMBL, PubChem, ClinicalTrials, FDA, arXiv',
    category: 'tools',
  },
  {
    command: '/sandbox',
    label: 'Python Sandbox Security Status',
    description: 'Check kernel-enforced air-gapped sandbox isolation (Seatbelt, bwrap, Low-Integrity)',
    category: 'tools',
  },
  {
    command: '/cost',
    label: 'Token Usage & Cost Analysis',
    description: 'Display estimated prompt/completion token consumption and cost',
    category: 'session',
  },
  {
    command: '/export',
    label: 'Export Evidence Report',
    description: 'Export complete evidence-anchored scientific report with citation matrix to Markdown file',
    category: 'session',
  },
  {
    command: '/clear',
    label: 'Clear Terminal History',
    description: 'Clear scrollback and history turns while preserving active session memory',
    category: 'session',
  },
  {
    command: '/new',
    label: 'New Scientific Session',
    description: 'Reset active session memory, plan milestones, and start fresh inquiry',
    category: 'session',
  },
  {
    command: '/help',
    label: 'Hotkeys & Command Reference',
    description: 'Display keyboard shortcuts and full CLI documentation',
    category: 'session',
    shortcut: '?',
  },
  {
    command: '/exit',
    label: 'Exit JunScience CLI',
    description: 'Gracefully close workstation and exit process',
    category: 'session',
  },
];

interface CommandPaletteModalProps {
  filterQuery?: string;
  onSelect: (command: string) => void;
  onClose: () => void;
}

export function CommandPaletteModal({
  filterQuery = '',
  onSelect,
  onClose,
}: CommandPaletteModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const cleanFilter = filterQuery.startsWith('/') ? filterQuery.slice(1).toLowerCase() : filterQuery.toLowerCase();
  const filtered = PALETTE_COMMANDS.filter((cmd) => {
    if (!cleanFilter) return true;
    return (
      cmd.command.toLowerCase().includes(cleanFilter) ||
      cmd.label.toLowerCase().includes(cleanFilter) ||
      cmd.description.toLowerCase().includes(cleanFilter)
    );
  });

  useInput((input, key) => {
    if (key.escape) {
      onClose();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, filtered.length - 1)));
      return;
    }

    if (key.downArrow) {
      setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
      return;
    }

    if (key.return) {
      if (filtered[selectedIndex]) {
        onSelect(filtered[selectedIndex].command);
      }
      return;
    }
  });

  const selected = filtered[selectedIndex];

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
          ⚡ JunScience Command Palette
        </Text>
        <Text color="dim">[↑/↓: Navigate  •  Enter: Run  •  Esc: Close]</Text>
      </Box>

      {filtered.slice(0, 8).map((cmd, idx) => {
        const isSelected = idx === selectedIndex;
        return (
          <Box key={cmd.command} justifyContent="space-between">
            <Box>
              <Text color={isSelected ? 'cyan' : 'dim'} bold>
                {isSelected ? '❯ ' : '  '}
              </Text>
              <Text bold color={isSelected ? 'cyan' : 'white'}>
                {cmd.command.padEnd(12)}
              </Text>
              <Text color={isSelected ? 'white' : 'gray'}>
                {cmd.label}
              </Text>
            </Box>
            {cmd.shortcut && (
              <Text color="yellow" bold>
                [{cmd.shortcut}]
              </Text>
            )}
          </Box>
        );
      })}

      {filtered.length === 0 && (
        <Box marginY={1}>
          <Text color="red">No commands matching &quot;{filterQuery}&quot;</Text>
        </Box>
      )}

      {selected && (
        <Box
          marginTop={1}
          paddingTop={1}
          borderStyle="single"
          borderColor="gray"
        >
          <Text color="cyan">{selected.description}</Text>
        </Box>
      )}
    </Box>
  );
}

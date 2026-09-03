import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';

export interface SlashCommandItem {
  label: string;
  value: string;
  description: string;
}

export const SLASH_COMMANDS: SlashCommandItem[] = [
  { label: '/model', value: '/model', description: 'Switch active LLM or launch Model Configuration Wizard' },
  { label: '/plan', value: '/plan', description: 'Switch to PLAN MODE (hypothesis deliberation & design)' },
  { label: '/act', value: '/act', description: 'Switch to ACT MODE (autonomous tool execution & synthesis)' },
  { label: '/mode', value: '/mode', description: 'Toggle between Plan and Act modes (or Shift+Tab)' },
  { label: '/tools', value: '/tools', description: 'List registered bioinformatics tools & database connectors' },
  { label: '/skills', value: '/skills', description: 'List active scientific domain skills (SOP workflows)' },
  { label: '/config', value: '/config', description: 'Inspect active model profile and endpoint configuration' },
  { label: '/cost', value: '/cost', description: 'View session token usage & estimated API cost' },
  { label: '/compact', value: '/compact', description: 'Condense working memory while preserving EV anchors' },
  { label: '/export', value: '/export', description: 'Export scientific findings & verified citations to Markdown' },
  { label: '/new', value: '/new', description: 'Start a fresh scientific inquiry session' },
  { label: '/clear', value: '/clear', description: 'Clear terminal viewport and history' },
  { label: '/help', value: '/help', description: 'Display complete command reference' },
  { label: '/exit', value: '/exit', description: 'Exit JunScience CLI' },
];

interface SlashCommandMenuProps {
  filterText: string;
  onSelect: (command: string) => void;
  onClose: () => void;
}

export function SlashCommandMenu({ filterText, onSelect, onClose }: SlashCommandMenuProps) {
  const query = filterText.startsWith('/') ? filterText.slice(1).toLowerCase() : filterText.toLowerCase();

  const filteredItems = SLASH_COMMANDS.filter((cmd) =>
    cmd.value.toLowerCase().includes(query) || cmd.description.toLowerCase().includes(query)
  );

  const selectItems = (filteredItems.length > 0 ? filteredItems : SLASH_COMMANDS).map((cmd) => ({
    label: `${cmd.label.padEnd(12)} - ${cmd.description}`,
    value: cmd.value,
  }));

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      paddingX={1}
      marginY={1}
    >
      <Box marginBottom={1} justifyContent="space-between">
        <Text bold color="cyan">
          ⚡ Slash Commands (Use ↑/↓ to navigate, Enter to select, Esc to dismiss)
        </Text>
        <Text color="gray">[Esc to Cancel]</Text>
      </Box>

      <SelectInput
        items={selectItems}
        onSelect={(item) => onSelect(item.value)}
      />
    </Box>
  );
}

import React from 'react';
import { Box, Text, useInput } from 'ink';
import { globalSkillRegistry } from '@junscience/core';
import { Table, Column } from './Table.js';

interface SkillsViewProps {
  onClose: () => void;
}

export function SkillsView({ onClose }: SkillsViewProps) {
  useInput((input, key) => {
    if (key.escape || key.return) {
      onClose();
    }
  });

  const skills = globalSkillRegistry.list();

  const columns: Column<any>[] = [
    { header: 'Skill Name', key: 'name', width: 22 },
    { header: 'Category', key: 'category', width: 14 },
    { header: 'Workflow Description', key: 'description', width: 45 },
  ];

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="magenta" paddingX={1} marginY={1}>
      <Box justifyContent="space-between">
        <Text bold color="magenta">
          🧬 Active Scientific Domain Skills (SOP Workflows) ({skills.length})
        </Text>
        <Text color="gray">[Press Enter or Esc to Close]</Text>
      </Box>

      <Table data={skills} columns={columns} borderColor="magenta" headerColor="magenta" />
    </Box>
  );
}

import React from 'react';
import { Box, Text, useInput } from 'ink';
import { globalToolRegistry } from '@junscience/core';
import { Table, Column } from './Table.js';

interface ToolsViewProps {
  onClose: () => void;
}

export function ToolsView({ onClose }: ToolsViewProps) {
  useInput((input, key) => {
    if (key.escape || key.return) {
      onClose();
    }
  });

  const tools = globalToolRegistry.list();

  const columns: Column<any>[] = [
    { header: 'Tool Name', key: 'name', width: 22 },
    { header: 'Category', key: 'category', width: 14 },
    { header: 'Description', key: 'description', width: 45 },
  ];

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={1} marginY={1}>
      <Box justifyContent="space-between">
        <Text bold color="cyan">
          🛠 Registered Scientific Tools & Database Connectors ({tools.length})
        </Text>
        <Text color="gray">[Press Enter or Esc to Close]</Text>
      </Box>

      <Table data={tools} columns={columns} borderColor="cyan" headerColor="cyan" />
    </Box>
  );
}

import React from 'react';
import { Box, Text, useInput } from 'ink';
import { PlanTaskItem } from './LiveExecutionPane.js';

interface PlanViewProps {
  tasks: PlanTaskItem[];
  onClose: () => void;
}

export function PlanView({ tasks, onClose }: PlanViewProps) {
  useInput((input, key) => {
    if (key.escape || key.return) {
      onClose();
    }
  });

  const DEFAULT_MILESTONES = [
    { id: 'TASK-1', category: 'databases', title: 'Retrieve Canonical Target Sequences, 3D Structures & Domain Topology' },
    { id: 'TASK-2', category: 'databases', title: 'Explore Bioactivity (IC50/Ki), Selectivity & Literature Associations' },
    { id: 'TASK-3', category: 'computation', title: 'Perform Local Sandbox Statistical Analysis, Radiomics or Clinical NLP' },
    { id: 'TASK-4', category: 'clinical', title: 'Validate Clinical Trial Endpoints, Safety Signals & Critique Gate Check' },
    { id: 'TASK-5', category: 'synthesis', title: 'Synthesize Evidence-Anchored Scientific Report & Traceability Index' },
  ];

  const displayTasks = tasks.length > 0 ? tasks : DEFAULT_MILESTONES.map((m) => ({
    id: m.id,
    title: `[${m.category}] ${m.title}`,
    status: 'pending' as const,
  }));

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="magenta"
      paddingX={1}
      paddingY={1}
      marginY={1}
    >
      <Box justifyContent="space-between" marginBottom={1}>
        <Text color="magenta" bold>
          📋 Explicit 5-Stage Scientific Research Plan & Progress Checklist
        </Text>
        <Text color="dim">[Esc / Enter: Close]</Text>
      </Box>

      {displayTasks.map((t) => {
        let statusBadge = <Text color="gray">[○ Pending]</Text>;
        if (t.status === 'completed') {
          statusBadge = <Text color="green" bold>[✔ Completed]</Text>;
        } else if (t.status === 'in_progress') {
          statusBadge = <Text color="yellow" bold>[⚡ In Progress]</Text>;
        } else if (t.status === 'failed') {
          statusBadge = <Text color="red" bold>[✖ Failed]</Text>;
        }

        const evs = (t as any).evidenceIds && (t as any).evidenceIds.length > 0
          ? ` (Anchors: ${(t as any).evidenceIds.join(', ')})`
          : '';

        return (
          <Box key={t.id} flexDirection="column" marginY={0} paddingLeft={1}>
            <Box>
              <Text color="cyan" bold>{t.id.toUpperCase()}: </Text>
              {statusBadge}
              <Text color={t.status === 'completed' ? 'dim' : 'white'}> {t.title}</Text>
              {evs && <Text color="cyan">{evs}</Text>}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

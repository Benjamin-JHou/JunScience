import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';

export interface PlanTaskItem {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  evidenceIds?: string[];
}

export interface ActiveToolInfo {
  toolName: string;
  input?: any;
  log?: string;
  percent?: number;
}

interface LiveExecutionPaneProps {
  isThinking: boolean;
  thoughtPhase?: string;
  thoughtText?: string;
  tasks: PlanTaskItem[];
  activeTool?: ActiveToolInfo | null;
  streamingDelta: string;
}

export function LiveExecutionPane({
  isThinking,
  thoughtPhase,
  thoughtText,
  tasks,
  activeTool,
  streamingDelta,
}: LiveExecutionPaneProps) {
  // Generate visual progress bar for tool percentage
  const renderProgressBar = (pct?: number) => {
    if (pct === undefined) return null;
    const totalBars = 20;
    const filled = Math.round((pct / 100) * totalBars);
    const empty = totalBars - filled;
    return (
      <Text color="cyan">
        [{'█'.repeat(filled)}{'░'.repeat(empty)}] {pct}%
      </Text>
    );
  };

  return (
    <Box flexDirection="column" marginY={1}>
      {/* 1. THINKING SPINNER */}
      {isThinking && (
        <Box marginBottom={1}>
          <Text color="yellow">
            <Spinner type="dots" />{' '}
          </Text>
          <Text color="yellow" bold>
            [{thoughtPhase || 'Reasoning'}]
          </Text>
          {thoughtText && (
            <Text color="dim"> {thoughtText}</Text>
          )}
        </Box>
      )}

      {/* 2. PLAN TRACKER CHECKLIST */}
      {tasks.length > 0 && (
        <Box
          flexDirection="column"
          borderStyle="single"
          borderColor="gray"
          paddingX={1}
          marginBottom={1}
        >
          <Text bold color="cyan">
            📋 Explicit Scientific Research Plan & Milestones:
          </Text>
          {tasks.map((t) => {
            let icon = <Text color="gray">[ ] </Text>;
            if (t.status === 'completed') icon = <Text color="green">[✔] </Text>;
            else if (t.status === 'in_progress') icon = <Text color="yellow">[⏳] </Text>;
            else if (t.status === 'failed') icon = <Text color="red">[✖] </Text>;

            const evs = t.evidenceIds && t.evidenceIds.length > 0 ? ` (${t.evidenceIds.join(', ')})` : '';

            return (
              <Box key={t.id} paddingLeft={1}>
                {icon}
                <Text bold color={t.status === 'in_progress' ? 'yellow' : 'white'}>
                  {t.id.toUpperCase()}:{' '}
                </Text>
                <Text color={t.status === 'completed' ? 'gray' : 'white'}>
                  {t.title}
                </Text>
                {evs && <Text color="cyan">{evs}</Text>}
              </Box>
            );
          })}
        </Box>
      )}

      {/* 3. ACTIVE TOOL CALL PROGRESS */}
      {activeTool && (
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor="blue"
          paddingX={1}
          marginBottom={1}
        >
          <Box>
            <Text color="cyan" bold>
              ⚙ Tool Calling: {activeTool.toolName}
            </Text>
            {activeTool.percent !== undefined && (
              <Box marginLeft={2}>{renderProgressBar(activeTool.percent)}</Box>
            )}
          </Box>
          {activeTool.log && (
            <Box paddingLeft={2} marginTop={0}>
              <Text color="dim">↳ {activeTool.log}</Text>
            </Box>
          )}
        </Box>
      )}

      {/* 4. LIVE STREAMING RESPONSE */}
      {streamingDelta.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text color="white">{streamingDelta}</Text>
        </Box>
      )}
    </Box>
  );
}

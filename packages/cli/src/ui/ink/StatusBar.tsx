import React from 'react';
import { Box, Text } from 'ink';

interface StatusBarProps {
  mode: 'act' | 'plan' | 'hypothesis';
  activeModel: string;
  activeAgentName?: string;
  activeAgentIcon?: string;
  turnCount: number;
  estTokens: number;
  toastMessage?: string | null;
}

export function StatusBar({
  mode,
  activeModel,
  activeAgentName = 'Lead Investigator',
  activeAgentIcon = '🔬',
  turnCount,
  estTokens,
  toastMessage,
}: StatusBarProps) {
  const estCost = ((estTokens / 1_000_000) * 0.28).toFixed(4);

  let modeLabel = '[ACT]';
  let modeColor = 'cyan';
  if (mode === 'plan') {
    modeLabel = '[PLAN]';
    modeColor = 'magenta';
  } else if (mode === 'hypothesis') {
    modeLabel = '[HYPOTHESIS]';
    modeColor = 'yellow';
  }

  return (
    <Box flexDirection="column" marginTop={1}>
      {/* Toast notifications */}
      {toastMessage && (
        <Box marginBottom={0} paddingX={1}>
          <Text color="yellow" bold>
            ✦ {toastMessage}
          </Text>
        </Box>
      )}

      {/* 1. Primary Footer Bar Matching Screenshot */}
      <Box justifyContent="space-between" paddingX={0}>
        {/* Left: Shift+Tab cycle modes */}
        <Box alignItems="center">
          <Text backgroundColor="cyan" color="black" bold>
            {' Shift+Tab '}
          </Text>
          <Text color="gray">
            {' '}cycle modes{' '}
          </Text>
          <Text color={modeColor} bold>
            {modeLabel}
          </Text>
        </Box>

        {/* Right: tab agents | ctrl+p commands */}
        <Box alignItems="center">
          <Text color="cyan" bold>tab</Text>
          <Text color="gray"> agents{'    '}</Text>
          <Text color="cyan" bold>ctrl+p</Text>
          <Text color="gray"> commands</Text>
        </Box>
      </Box>

      {/* 2. Secondary Agent & Session Status Metadata */}
      <Box justifyContent="space-between" marginTop={0} paddingX={0}>
        <Box>
          <Text color="dim">Agent: </Text>
          <Text color="white" bold>
            {activeAgentIcon} {activeAgentName.replace('Scientific ', '')}
          </Text>
          <Text color="gray"> │ </Text>
          <Text color="dim">Model: </Text>
          <Text color="yellow" bold>
            {activeModel.length > 20 ? activeModel.slice(0, 18) + '…' : activeModel}
          </Text>
        </Box>
        <Box>
          <Text color="dim">
            Turns: <Text color="white">{turnCount}</Text> │ <Text color="cyan">~{estTokens.toLocaleString()}</Text> toks (<Text color="green">${estCost}</Text>)
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

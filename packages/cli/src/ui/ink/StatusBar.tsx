import React from 'react';
import { Box, Text } from 'ink';

interface StatusBarProps {
  mode: 'plan' | 'act';
  activeModel: string;
  turnCount: number;
  estTokens: number;
  toastMessage?: string | null;
}

export function StatusBar({
  mode,
  activeModel,
  turnCount,
  estTokens,
  toastMessage,
}: StatusBarProps) {
  const estCost = ((estTokens / 1_000_000) * 0.28).toFixed(4);

  return (
    <Box flexDirection="column" marginTop={1}>
      {toastMessage && (
        <Box marginBottom={0} paddingX={1}>
          <Text color="yellow" bold>
            ✦ {toastMessage}
          </Text>
        </Box>
      )}

      <Box
        borderStyle="round"
        borderColor={mode === 'plan' ? 'magenta' : 'green'}
        paddingX={1}
        justifyContent="space-between"
      >
        <Box flexShrink={0}>
          {mode === 'plan' ? (
            <Text color="magenta" bold>
              [PLAN]{' '}
            </Text>
          ) : (
            <Text color="green" bold>
              [ACT]{' '}
            </Text>
          )}
          <Text color="white" bold>
            {activeModel}
          </Text>
          <Text color="gray"> │ </Text>
          <Text color="gray">
            Turns: <Text color="white">{turnCount}</Text> │ <Text color="cyan">~{estTokens.toLocaleString()}</Text> toks (<Text color="green">${estCost}</Text>)
          </Text>
        </Box>

        <Box flexShrink={0}>
          <Text color="dim">
            <Text color="yellow" bold>[Shift+Tab]</Text> Mode  <Text color="yellow" bold>[/]</Text> Cmds  <Text color="yellow" bold>[/model]</Text> Config
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

import React from 'react';
import { Box, Text } from 'ink';
import cliPkg from '../../../package.json' with { type: 'json' };

interface BannerProps {
  activeModel?: string;
  mode: 'act' | 'plan' | 'hypothesis';
  activeAgentName?: string;
  hasHistory?: boolean;
}

export function Banner({
  activeModel = 'Demo Mode (Mock)',
  mode,
  activeAgentName = 'Lead Investigator',
  hasHistory = false,
}: BannerProps) {
  const version = cliPkg.version || '1.4.0';

  if (hasHistory) {
    return (
      <Box flexDirection="row" justifyContent="space-between" paddingBottom={1} borderStyle="single" borderColor="gray">
        <Box>
          <Text color="cyan" bold>⚛ JunScience</Text>
          <Text color="dim"> v{version} │ </Text>
          <Text color="cyan">Agent: </Text>
          <Text color="white" bold>{activeAgentName} │ </Text>
          <Text color="cyan">Model: </Text>
          <Text color="yellow" bold>{activeModel}</Text>
        </Box>
        <Box>
          {mode === 'act' && <Text color="cyan" bold>[ACT MODE]</Text>}
          {mode === 'plan' && <Text color="magenta" bold>[PLAN MODE]</Text>}
          {mode === 'hypothesis' && <Text color="yellow" bold>[HYPOTHESIS TREE]</Text>}
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" marginY={1}>
      {/* 1. ATOMIC QUANTUM ORBITAL & CLEAN JUNSCIENCE TITLE */}
      <Box flexDirection="row" alignItems="center">
        {/* Quantum Orbital Science Icon */}
        <Box flexDirection="column" marginRight={2}>
          <Text color="cyan">      ╷ ╭─╮ ╷      </Text>
          <Text color="cyan">    ╭─┴─╯ │ ╰─┴─╮  </Text>
          <Text color="cyan">   ╭╯  ╲  │  ╱  ╰╮ </Text>
          <Text color="cyan">  ──<Text color="yellow">●</Text>───<Text color="white">[ </Text><Text color="cyanBright" bold>J</Text><Text color="white"> ]</Text>───<Text color="yellow">●</Text>──</Text>
          <Text color="cyan">   ╰╮  ╱  │  ╲  ╭╯ </Text>
          <Text color="cyan">    ╰─┬─╮ │ ╭─┬─╯  </Text>
          <Text color="cyan">      ╵ ╰─╯ ╵      </Text>
        </Box>

        {/* Crisp Unambiguous Typography */}
        <Box flexDirection="column">
          <Text color="cyanBright" bold>
            {'  █ █ █ █▄ █  ███  ███ █ ███ █▄ █ ███ ███'}
          </Text>
          <Text color="cyanBright" bold>
            {'  █ █ █ █ ▀█  █▄▄ █    █ █▄▄ █ ▀█ █   █▄▄'}
          </Text>
          <Text color="cyanBright" bold>
            {'█ █ █ █ █  █    █ █    █ █   █  █ █   █  '}
          </Text>
          <Text color="cyanBright" bold>
            {'▀█▀ ▀█▀ ▀  ▀  ███  ███ ▀ ███ ▀  ▀ ███ ███'}
          </Text>
          <Box marginTop={1}>
            <Text color="white" bold>
              AI for Scientific Discovery
            </Text>
          </Box>
        </Box>
      </Box>

      {/* 2. WELCOME STATEMENT MATCHING SCREENSHOT */}
      <Box flexDirection="column" marginTop={1}>
        <Text color="cyan" bold>
          {'> '}
          <Text color="white" bold>
            Welcome to JunScience CLI <Text color="dim">(v{version})</Text>
          </Text>
        </Text>
        <Text color="gray">
          {'  '}Your AI research agent for real scientific discovery.
        </Text>
      </Box>
    </Box>
  );
}

import React from 'react';
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';
import cliPkg from '../../../package.json' with { type: 'json' };

const ASCII_LOGO = `
    __                  _____                             
   / /_  ______        / ___/_____(_)__  ____  ________  
  / / / / / __ \\______ \\__ \\/ ___/ / _ \\/ __ \\/ ___/ _ \\ 
 / / /_/ / / / /_____/___/ / /__/ /  __/ / / / /__/  __/ 
/_/\\__,_/_/ /_/      /____/\\___/_/\\___/_/ /_/\\___/\\___/  
`;

interface BannerProps {
  activeModel?: string;
  mode: 'plan' | 'act';
}

export function Banner({ activeModel = 'Demo Mode (Mock)', mode }: BannerProps) {
  const version = cliPkg.version || '1.4.0';

  return (
    <Box flexDirection="column" marginY={1}>
      <Gradient name="cristal">
        <Text bold>{ASCII_LOGO}</Text>
      </Gradient>

      <Box flexDirection="column" marginTop={0} paddingLeft={1}>
        <Text color="gray">
          ── <Text color="cyan" bold>Scientific AI Workstation</Text> & Autonomous Research Engine ──
        </Text>

        <Box marginTop={1}>
          <Text color="dim">Version: </Text>
          <Text color="cyan" bold>v{version}</Text>
          <Text color="dim">  •  Active Model: </Text>
          <Text color="yellow" bold>{activeModel}</Text>
          <Text color="dim">  •  Mode: </Text>
          {mode === 'plan' ? (
            <Text color="magenta" bold>[PLAN MODE]</Text>
          ) : (
            <Text color="green" bold>[ACT MODE]</Text>
          )}
        </Box>

        <Box marginTop={0}>
          <Text color="gray">
            Hotkeys: <Text color="white" bold>[Shift+Tab]</Text> Toggle Mode  •  <Text color="white" bold>[/]</Text> Slash Commands  •  <Text color="white" bold>[/model]</Text> Config Wizard
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

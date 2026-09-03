import React from 'react';
import { Box, Text, useInput } from 'ink';

interface HelpViewProps {
  onClose: () => void;
}

export function HelpView({ onClose }: HelpViewProps) {
  useInput((input, key) => {
    if (key.escape || key.return) {
      onClose();
    }
  });

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="yellow" paddingX={1} marginY={1}>
      <Box justifyContent="space-between" marginBottom={1}>
        <Text bold color="yellow">
          📖 JunScience CLI — Command & Keybinding Reference
        </Text>
        <Text color="gray">[Press Enter or Esc to Close]</Text>
      </Box>

      <Box flexDirection="column">
        <Text bold color="cyan">Global Hotkeys:</Text>
        <Text>  <Text color="yellow" bold>[Shift+Tab]</Text>      Seamlessly toggle between <Text color="magenta">[PLAN]</Text> and <Text color="green">[ACT]</Text> modes</Text>
        <Text>  <Text color="yellow" bold>[/]</Text>              Open interactive Slash Commands popup menu</Text>
        <Text>  <Text color="yellow" bold>[Esc]</Text>            Dismiss active modal/popup and focus chat prompt</Text>
        <Text>  <Text color="yellow" bold>[Ctrl+C]</Text>         Exit JunScience CLI</Text>

        <Box marginTop={1} flexDirection="column">
          <Text bold color="cyan">Core Commands:</Text>
          <Text>  <Text color="green" bold>/model</Text>           Open interactive Model Selector & Configuration Wizard</Text>
          <Text>  <Text color="magenta" bold>/plan</Text>            Switch to PLAN MODE (hypothesis deliberation & design)</Text>
          <Text>  <Text color="green" bold>/act</Text>             Switch to ACT MODE (autonomous sandbox tool execution)</Text>
          <Text>  <Text color="cyan" bold>/tools</Text>            Inspect registered bioinformatics & molecular databases</Text>
          <Text>  <Text color="cyan" bold>/skills</Text>           Inspect active scientific domain SOP workflows</Text>
          <Text>  <Text color="cyan" bold>/config</Text>           View current active LLM parameters and API endpoint</Text>
          <Text>  <Text color="cyan" bold>/cost</Text>             Display token usage, context saturation, and API bill</Text>
          <Text>  <Text color="cyan" bold>/compact</Text>          Compact context memory while preserving EV anchors</Text>
          <Text>  <Text color="cyan" bold>/export</Text>           Export session findings and citations to Markdown</Text>
          <Text>  <Text color="cyan" bold>/new</Text>              Start a fresh scientific research session</Text>
          <Text>  <Text color="cyan" bold>/clear</Text>            Clear terminal history</Text>
          <Text>  <Text color="cyan" bold>/exit</Text>             Quit CLI</Text>
        </Box>
      </Box>
    </Box>
  );
}

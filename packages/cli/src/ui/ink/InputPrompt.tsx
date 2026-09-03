import React from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

interface InputPromptProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  mode: 'plan' | 'act';
  disabled?: boolean;
}

export function InputPrompt({
  value,
  onChange,
  onSubmit,
  mode,
  disabled = false,
}: InputPromptProps) {
  return (
    <Box marginTop={1} flexDirection="column">
      <Box alignItems="center">
        {mode === 'plan' ? (
          <Text bold color="magenta">
            [PLAN] junscience &gt;{' '}
          </Text>
        ) : (
          <Text bold color="green">
            [ACT] junscience &gt;{' '}
          </Text>
        )}

        {!disabled ? (
          <TextInput
            value={value}
            onChange={onChange}
            onSubmit={onSubmit}
            placeholder="Ask a scientific inquiry, or type / for commands..."
          />
        ) : (
          <Text color="gray">Processing inquiry...</Text>
        )}
      </Box>
    </Box>
  );
}

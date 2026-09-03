import React from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

interface InputPromptProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  mode: 'act' | 'plan' | 'hypothesis';
  disabled?: boolean;
}

export function InputPrompt({
  value,
  onChange,
  onSubmit,
  mode,
  disabled = false,
}: InputPromptProps) {
  let borderColor = 'cyan';
  let promptColor = 'cyan';
  if (mode === 'plan') {
    borderColor = 'magenta';
    promptColor = 'magenta';
  } else if (mode === 'hypothesis') {
    borderColor = 'yellow';
    promptColor = 'yellow';
  }

  return (
    <Box
      borderStyle="round"
      borderColor={borderColor}
      paddingX={1}
      paddingY={0}
      marginTop={1}
    >
      <Text color={promptColor} bold>
        {'> '}
      </Text>

      {!disabled ? (
        <TextInput
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          placeholder="Ask a research question or describe your task..."
          focus={!disabled}
        />
      ) : (
        <Text color="gray">Processing inquiry across scientific tools...</Text>
      )}
    </Box>
  );
}

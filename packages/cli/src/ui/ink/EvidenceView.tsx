import React from 'react';
import { Box, Text, useInput } from 'ink';
import { globalEvidenceTracker } from '@junscience/core';

interface EvidenceViewProps {
  onClose: () => void;
}

export function EvidenceView({ onClose }: EvidenceViewProps) {
  useInput((input, key) => {
    if (key.escape || key.return) {
      onClose();
    }
  });

  const records = globalEvidenceTracker.list();

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="blue"
      paddingX={1}
      paddingY={1}
      marginY={1}
    >
      <Box justifyContent="space-between" marginBottom={1}>
        <Text color="blue" bold>
          📚 Immutable Scientific Evidence Ledger ({records.length} Records)
        </Text>
        <Text color="dim">[Esc / Enter: Close]</Text>
      </Box>

      {records.length === 0 ? (
        <Box marginY={1}>
          <Text color="gray">No evidence anchors recorded in this session yet. Execute an inquiry to ingest verified data.</Text>
        </Box>
      ) : (
        records.map((ev: any) => {
          let statusTag = <Text color="green" bold>[VERIFIED]</Text>;
          if (ev.verificationStatus === 'flagged') {
            statusTag = <Text color="yellow" bold>[FLAGGED]</Text>;
          } else if (ev.verificationStatus === 'rejected') {
            statusTag = <Text color="red" bold>[REJECTED]</Text>;
          }

          return (
            <Box key={ev.id} flexDirection="column" marginY={0} paddingLeft={1}>
              <Box>
                <Text color="cyan" bold>{ev.id}</Text>
                <Text color="gray"> ({ev.toolName}) </Text>
                {statusTag}
                <Text color="white"> — {ev.summary.slice(0, 75)}</Text>
              </Box>
            </Box>
          );
        })
      )}
    </Box>
  );
}

import React from 'react';
import { Box, Text, Static } from 'ink';
import { Artifact, Citation } from '@junscience/core';

export interface HistoryTurn {
  id: string;
  inquiry: string;
  mode: 'plan' | 'act';
  timestamp: string;
  response: string;
  artifacts?: Artifact[];
  citations?: Citation[];
  toolsExecuted?: Array<{ name: string; summary?: string; duration?: string }>;
}

interface HistoryPaneProps {
  history: HistoryTurn[];
}

export function HistoryPane({ history }: HistoryPaneProps) {
  return (
    <Static items={history}>
      {(item) => (
        <Box key={item.id} flexDirection="column" marginY={1}>
          {/* User Inquiry Box */}
          <Box borderStyle="round" borderColor={item.mode === 'plan' ? 'magenta' : 'green'} paddingX={1}>
            <Text bold color={item.mode === 'plan' ? 'magenta' : 'green'}>
              {item.mode === 'plan' ? '[PLAN] ' : '[ACT] '}
            </Text>
            <Text bold color="white">
              {item.inquiry}
            </Text>
            <Box marginLeft={2}>
              <Text color="dim">({item.timestamp})</Text>
            </Box>
          </Box>

          {/* Tools Executed Summary */}
          {item.toolsExecuted && item.toolsExecuted.length > 0 && (
            <Box flexDirection="column" marginTop={1} paddingLeft={2}>
              <Text color="gray" bold>
                ⚙ Verified Tools Executed:
              </Text>
              {item.toolsExecuted.map((t, idx) => (
                <Box key={idx} paddingLeft={2}>
                  <Text color="green">✔ {t.name}</Text>
                  {t.duration && <Text color="dim"> ({t.duration})</Text>}
                  <Text color="white">: {t.summary || 'Completed'}</Text>
                </Box>
              ))}
            </Box>
          )}

          {/* Agent Response */}
          <Box marginTop={1} paddingLeft={1} flexDirection="column">
            <Text color="white">{item.response}</Text>
          </Box>

          {/* Synthesized Artifacts */}
          {item.artifacts && item.artifacts.length > 0 && (
            <Box flexDirection="column" marginTop={1} paddingLeft={2} borderStyle="single" borderColor="magenta">
              <Text bold color="magenta">
                📦 Synthesized Scientific Artifacts ({item.artifacts.length}):
              </Text>
              {item.artifacts.map((art, idx) => (
                <Box key={idx} paddingLeft={2}>
                  <Text color="magenta" bold>
                    [{idx + 1}] {art.title}{' '}
                  </Text>
                  <Text color="dim">({art.type.toUpperCase()})</Text>
                </Box>
              ))}
            </Box>
          )}

          {/* Citations & Evidence */}
          {item.citations && item.citations.length > 0 && (
            <Box flexDirection="column" marginTop={1} paddingLeft={2} borderStyle="single" borderColor="blue">
              <Text bold color="blue">
                📚 Grounded Primary Literature & Verified Evidence:
              </Text>
              {item.citations.map((cit) => (
                <Box key={cit.index} paddingLeft={2} flexDirection="column">
                  <Text color="cyan" bold>
                    [{cit.index}] {cit.title}
                  </Text>
                  <Text color="dim">
                    {cit.authors} ({cit.year}) • {cit.journal}
                    {cit.pmid ? ` • PMID: ${cit.pmid}` : ''}
                    {cit.doi ? ` • DOI: ${cit.doi}` : ''}
                  </Text>
                </Box>
              ))}
            </Box>
          )}

          <Box marginTop={1}>
            <Text color="gray">
              ────────────────────────────────────────────────────────────────────────
            </Text>
          </Box>
        </Box>
      )}
    </Static>
  );
}

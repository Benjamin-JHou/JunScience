import React from 'react';
import { Box, Text } from 'ink';

export interface Column<T> {
  header: string;
  key?: keyof T;
  render?: (row: T) => React.ReactNode;
  width?: number;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  borderColor?: string;
  headerColor?: string;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  borderColor = 'gray',
  headerColor = 'cyan',
}: TableProps<T>) {
  // Calculate column widths
  const computedWidths = columns.map((col) => {
    if (col.width) return col.width;
    let max = col.header.length;
    for (const row of data) {
      const val = col.key ? String(row[col.key] ?? '') : '';
      if (val.length > max) max = Math.min(val.length, 40);
    }
    return Math.max(max + 2, 10);
  });

  return (
    <Box flexDirection="column" marginY={1}>
      {/* Header Row */}
      <Box borderStyle="single" borderColor={borderColor} paddingX={1}>
        {columns.map((col, idx) => (
          <Box key={idx} width={computedWidths[idx]}>
            <Text bold color={headerColor}>
              {col.header}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Data Rows */}
      {data.map((row, rowIdx) => (
        <Box key={rowIdx} paddingX={1} borderStyle="single" borderColor="gray" borderTop={false} borderBottom={rowIdx === data.length - 1} borderLeft={true} borderRight={true}>
          {columns.map((col, colIdx) => (
            <Box key={colIdx} width={computedWidths[colIdx]}>
              {col.render ? (
                col.render(row)
              ) : (
                <Text color="white" wrap="truncate-end">
                  {col.key ? String(row[col.key] ?? '') : ''}
                </Text>
              )}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}

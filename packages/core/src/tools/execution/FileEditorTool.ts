import { ToolDefinition, ToolContext, ToolExecutionResult } from '../../types/tools.js';
import { ToolExecution } from '../../types/runtime.js';
import { resolveWorkspaceRoot } from './PythonRunnerTool.js';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

export type FileEditorAction = 'view' | 'write' | 'str_replace' | 'insert_lines' | 'append';

export interface FileEditorInput {
  path: string;
  action: FileEditorAction;
  startLine?: number;
  endLine?: number;
  content?: string;
  oldStr?: string;
  newStr?: string;
  insertAfterLine?: number;
  insertContent?: string;
  appendContent?: string;
}

function makeExecution(
  toolName: string,
  isSuccess: boolean,
  summary: string,
  durationMs: number
): ToolExecution {
  return {
    id: `EXEC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    toolName,
    category: 'execution',
    description: summary,
    status: isSuccess ? 'completed' : 'failed',
    logs: [summary],
    duration: `${durationMs}ms`,
    resultSummary: summary,
  };
}

function findSymlinkComponent(root: string, target: string): string | undefined {
  const relative = path.relative(root, target);
  let current = root;
  for (const component of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, component);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) {
      return current;
    }
  }
  return undefined;
}

export const FileEditorTool: ToolDefinition<FileEditorInput> = {
  name: 'file_editor',
  description: 'Confined workspace text file editor. Read, create, replace, insert, or append text files strictly within the session workspace.',
  category: 'execution',
  requiredPermission: 'WRITE',
  inputSchema: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Relative path of the target file inside the session workspace' },
      action: {
        type: 'string',
        enum: ['view', 'write', 'str_replace', 'insert_lines', 'append'],
        description: 'Operation to perform on the text file',
      },
      startLine: { type: 'number', description: '1-indexed start line for view action' },
      endLine: { type: 'number', description: '1-indexed end line for view action' },
      content: { type: 'string', description: 'Full file content for write action' },
      oldStr: { type: 'string', description: 'Target string to uniquely replace in str_replace action' },
      newStr: { type: 'string', description: 'Replacement string for str_replace action' },
      insertAfterLine: { type: 'number', description: 'Line number after which to insert (0 for top of file)' },
      insertContent: { type: 'string', description: 'Text content to insert' },
      appendContent: { type: 'string', description: 'Text content to append to file' },
    },
    required: ['path', 'action'],
  },
  async execute(input: FileEditorInput, context: ToolContext): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const workspaceRoot = resolveWorkspaceRoot();
    const sessionId = context.sessionId || 'default';
    if (path.isAbsolute(sessionId) || sessionId.includes('/') || sessionId.includes('\\') || sessionId.includes('\0')) {
      const errorMsg = '[SecurityError]: Invalid session identifier for confined file operations.';
      return {
        success: false,
        error: errorMsg,
        output: null,
        execution: makeExecution('file_editor', false, errorMsg, Date.now() - startTime),
      };
    }
    const confinementRoot = path.resolve(workspaceRoot);
    const sessionWorkspace = path.resolve(confinementRoot, 'workspace', sessionId);

    // 1. Ensure session workspace directory exists
    if (!fs.existsSync(sessionWorkspace)) {
      fs.mkdirSync(sessionWorkspace, { recursive: true, mode: 0o700 });
    }

    // 2. Strict path normalization and boundary containment check
    const resolvedTarget = path.normalize(path.resolve(sessionWorkspace, input.path));
    if (!resolvedTarget.startsWith(sessionWorkspace + path.sep) && resolvedTarget !== sessionWorkspace) {
      const errorMsg = `[SecurityError]: Access denied: Target path '${input.path}' (resolved: '${resolvedTarget}') escapes session workspace boundary '${sessionWorkspace}'.`;
      return {
        success: false,
        error: errorMsg,
        output: null,
        execution: makeExecution('file_editor', false, errorMsg, Date.now() - startTime),
      };
    }

    const symlinkComponent = findSymlinkComponent(confinementRoot, resolvedTarget);
    if (symlinkComponent) {
      const errorMsg = `[SecurityError]: Symbolic links are not permitted in confined file paths ('${symlinkComponent}').`;
      return {
        success: false,
        error: errorMsg,
        output: null,
        execution: makeExecution('file_editor', false, errorMsg, Date.now() - startTime),
      };
    }

    try {
      switch (input.action) {
        case 'view': {
          if (!fs.existsSync(resolvedTarget)) {
            const errorMsg = `[NotFoundError]: Target file '${input.path}' does not exist in workspace.`;
            return {
              success: false,
              error: errorMsg,
              output: null,
              execution: makeExecution('file_editor', false, errorMsg, Date.now() - startTime),
            };
          }

          const fileContent = fs.readFileSync(resolvedTarget, 'utf-8');
          const lines = fileContent.split('\n');
          const totalLines = lines.length;

          const start = Math.max(1, input.startLine || 1);
          const end = Math.min(totalLines, input.endLine || Math.min(totalLines, start + 199));
          const slicedLines = lines.slice(start - 1, end);

          const output = {
            path: input.path,
            totalLines,
            displayedRange: [start, end],
            content: slicedLines.join('\n'),
          };

          const summary = `Read ${end - start + 1} lines from ${input.path} (${start}-${end} of ${totalLines})`;
          return {
            success: true,
            output,
            execution: makeExecution('file_editor', true, summary, Date.now() - startTime),
          };
        }

        case 'write': {
          const content = input.content !== undefined ? input.content : '';
          const parentDir = path.dirname(resolvedTarget);
          if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir, { recursive: true, mode: 0o700 });
          }

          fs.writeFileSync(resolvedTarget, content, { encoding: 'utf-8', mode: 0o600 });
          const totalLinesAfter = content === '' ? 0 : content.split('\n').length;
          const bytesWritten = Buffer.byteLength(content, 'utf-8');

          const output = {
            path: input.path,
            action: 'write',
            success: true,
            totalLinesAfter,
            bytesWritten,
          };

          const summary = `Wrote ${totalLinesAfter} lines (${bytesWritten} bytes) to ${input.path}`;
          return {
            success: true,
            output,
            execution: makeExecution('file_editor', true, summary, Date.now() - startTime),
          };
        }

        case 'str_replace': {
          if (!fs.existsSync(resolvedTarget)) {
            const errorMsg = `[NotFoundError]: Target file '${input.path}' does not exist in workspace.`;
            return {
              success: false,
              error: errorMsg,
              output: null,
              execution: makeExecution('file_editor', false, errorMsg, Date.now() - startTime),
            };
          }

          if (input.oldStr === undefined || input.oldStr === '') {
            const errorMsg = `[EditError]: 'oldStr' parameter cannot be empty for str_replace action.`;
            return {
              success: false,
              error: errorMsg,
              output: null,
              execution: makeExecution('file_editor', false, errorMsg, Date.now() - startTime),
            };
          }

          const fileContent = fs.readFileSync(resolvedTarget, 'utf-8');
          const occurrences = fileContent.split(input.oldStr).length - 1;

          if (occurrences === 0) {
            const errorMsg = `[EditError]: oldStr was not found in '${input.path}'. Ensure target substring matches file content exactly.`;
            return {
              success: false,
              error: errorMsg,
              output: null,
              execution: makeExecution('file_editor', false, errorMsg, Date.now() - startTime),
            };
          }

          if (occurrences > 1) {
            const errorMsg = `[EditError]: oldStr matched ${occurrences} times in '${input.path}'. Please provide more unique surrounding lines to disambiguate replacement.`;
            return {
              success: false,
              error: errorMsg,
              output: null,
              execution: makeExecution('file_editor', false, errorMsg, Date.now() - startTime),
            };
          }

          const newContent = fileContent.replace(input.oldStr, input.newStr || '');
          fs.writeFileSync(resolvedTarget, newContent, { encoding: 'utf-8', mode: 0o600 });
          const totalLinesAfter = newContent.split('\n').length;

          const previewDiff = `- ${input.oldStr.split('\n')[0]}\n+ ${(input.newStr || '').split('\n')[0]}`;
          const output = {
            path: input.path,
            action: 'str_replace',
            success: true,
            totalLinesAfter,
            previewDiff,
          };

          const summary = `Replaced target substring in ${input.path} (Total lines: ${totalLinesAfter})`;
          return {
            success: true,
            output,
            execution: makeExecution('file_editor', true, summary, Date.now() - startTime),
          };
        }

        case 'insert_lines': {
          if (!fs.existsSync(resolvedTarget)) {
            const errorMsg = `[NotFoundError]: Target file '${input.path}' does not exist in workspace.`;
            return {
              success: false,
              error: errorMsg,
              output: null,
              execution: makeExecution('file_editor', false, errorMsg, Date.now() - startTime),
            };
          }

          const fileContent = fs.readFileSync(resolvedTarget, 'utf-8');
          const lines = fileContent.split('\n');
          const insertLine = Math.max(0, input.insertAfterLine || 0);
          const insertLines = (input.insertContent || '').split('\n');

          lines.splice(insertLine, 0, ...insertLines);
          const newContent = lines.join('\n');
          fs.writeFileSync(resolvedTarget, newContent, { encoding: 'utf-8', mode: 0o600 });

          const output = {
            path: input.path,
            action: 'insert_lines',
            success: true,
            insertedLinesCount: insertLines.length,
            totalLinesAfter: lines.length,
          };

          const summary = `Inserted ${insertLines.length} lines after line ${insertLine} in ${input.path}`;
          return {
            success: true,
            output,
            execution: makeExecution('file_editor', true, summary, Date.now() - startTime),
          };
        }

        case 'append': {
          const appendText = input.appendContent || '';
          const parentDir = path.dirname(resolvedTarget);
          if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir, { recursive: true, mode: 0o700 });
          }

          let currentContent = '';
          if (fs.existsSync(resolvedTarget)) {
            currentContent = fs.readFileSync(resolvedTarget, 'utf-8');
          }

          const separator = currentContent.length > 0 && !currentContent.endsWith('\n') ? '\n' : '';
          const newContent = currentContent + separator + appendText;
          fs.writeFileSync(resolvedTarget, newContent, { encoding: 'utf-8', mode: 0o600 });
          const totalLinesAfter = newContent.split('\n').length;

          const output = {
            path: input.path,
            action: 'append',
            success: true,
            totalLinesAfter,
          };

          const summary = `Appended ${appendText.split('\n').length} lines to ${input.path} (Total lines: ${totalLinesAfter})`;
          return {
            success: true,
            output,
            execution: makeExecution('file_editor', true, summary, Date.now() - startTime),
          };
        }

        default: {
          const errorMsg = `Unsupported file_editor action: '${(input as any).action}'`;
          return {
            success: false,
            error: errorMsg,
            output: null,
            execution: makeExecution('file_editor', false, errorMsg, Date.now() - startTime),
          };
        }
      }
    } catch (err: any) {
      const errorMsg = `[FileEditorError]: ${err.message || String(err)}`;
      return {
        success: false,
        error: errorMsg,
        output: null,
        execution: makeExecution('file_editor', false, errorMsg, Date.now() - startTime),
      };
    }
  },
};

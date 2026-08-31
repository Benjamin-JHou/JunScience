import React, { useState } from 'react';
import {
  Files,
  FileText,
  Image as ImageIcon,
  Table,
  Code,
  Download,
  Search,
  Sparkles,
  Eye,
} from 'lucide-react';
import { useAgent } from '../../context/AgentContext';
import { useNav } from '../../context/NavContext';

interface WorkspaceFileItem {
  id: string;
  name: string;
  type: 'figure' | 'dataset' | 'manuscript' | 'code';
  size: string;
  sessionTitle: string;
  description: string;
  downloadData?: string;
}

export const WorkspaceFilesView: React.FC = () => {
  const { currentSession, sessions, resetSession } = useAgent();
  const { setActiveSection } = useNav();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [previewContent, setPreviewContent] = useState<{ title: string; content: string } | null>(null);

  // Aggregate artifacts across all sessions
  const allFiles: WorkspaceFileItem[] = [];

  const sourceSessions = [currentSession, ...sessions.filter((s) => s.id !== currentSession.id)];

  sourceSessions.forEach((sess) => {
    sess.messages?.forEach((msg) => {
      msg.artifacts?.forEach((art) => {
        let type: WorkspaceFileItem['type'] = 'manuscript';
        if (art.type === 'figure' || art.title.endsWith('.png') || art.title.endsWith('.svg')) type = 'figure';
        else if (art.type === 'dataset' || art.type === 'table' || art.title.endsWith('.csv')) type = 'dataset';
        else if (art.type === 'code' || art.title.endsWith('.py') || art.title.endsWith('.r')) type = 'code';

        allFiles.push({
          id: art.id,
          name: art.title,
          type,
          size: art.type === 'figure' ? '2.4 MB' : '48 KB',
          sessionTitle: sess.title,
          description: art.description,
          downloadData: art.description,
        });
      });
    });
  });

  const filteredFiles = allFiles.filter((file) => {
    const matchesType = selectedType === 'All' || file.type === selectedType;
    const matchesSearch =
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.sessionTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getFileIcon = (type: WorkspaceFileItem['type']) => {
    switch (type) {
      case 'figure':
        return ImageIcon;
      case 'dataset':
        return Table;
      case 'code':
        return Code;
      default:
        return FileText;
    }
  };

  const handleDownload = (file: WorkspaceFileItem) => {
    const blob = new Blob([file.downloadData || file.description], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStartNew = () => {
    resetSession();
    setActiveSection('home');
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-6 sm:p-10 max-w-[1100px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="text-left">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-accent/10 text-accent">
              <Files size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">Workspace Files & Artifacts</h2>
              <p className="text-sm text-text-secondary mt-0.5">
                Generated figures, scientific datasets, reproducible scripts, and manuscript drafts.
              </p>
            </div>
          </div>
        </div>

        <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-bg-surface border border-border text-accent">
          {filteredFiles.length} {filteredFiles.length === 1 ? 'Artifact' : 'Artifacts'}
        </span>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-6">
        <div className="flex items-center gap-1.5">
          {['All', 'figure', 'dataset', 'code', 'manuscript'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedType(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                selectedType === tab
                  ? 'bg-accent text-white shadow-xs font-semibold'
                  : 'bg-bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              }`}
            >
              {tab === 'All' ? 'All Files' : tab}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search file name or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-bg-surface border border-border focus:border-accent text-xs text-text-primary placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* Files List */}
      {filteredFiles.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-bg-surface border border-border border-dashed space-y-4 my-8">
          <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
            <Files size={24} />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-semibold text-text-primary">
              {searchQuery ? 'No matching artifacts found' : 'No workspace files generated yet'}
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {searchQuery
                ? `No files matched "${searchQuery}". Try a different search term.`
                : 'Files generated during your research sessions (such as volcano plots, DESeq2 matrices, and manuscript drafts) will appear here for one-click download.'}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={handleStartNew}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors shadow-sm"
            >
              <Sparkles size={14} />
              <span>Generate Research Files</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => {
            const Icon = getFileIcon(file.type);
            return (
              <div
                key={file.id}
                className="flex flex-col justify-between p-4 rounded-xl bg-bg-surface border border-border hover:border-accent/40 transition-all shadow-xs group"
              >
                <div className="space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                      <Icon size={12} />
                      <span className="capitalize">{file.type}</span>
                    </span>
                    <span className="text-[11px] font-mono text-text-muted">{file.size}</span>
                  </div>

                  <h4 className="text-[14px] font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                    {file.name}
                  </h4>

                  <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                    {file.description}
                  </p>

                  <p className="text-[11px] text-text-muted truncate pt-1">
                    From: {file.sessionTitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPreviewContent({ title: file.name, content: file.description })}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border hover:border-accent/40 bg-bg-elevated hover:bg-bg-hover text-text-secondary hover:text-text-primary text-xs font-medium transition-all"
                  >
                    <Eye size={13} />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => handleDownload(file)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-colors"
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Simple Modal Preview */}
      {previewContent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6 z-50">
          <div className="bg-bg-surface border border-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-left">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-text-primary">{previewContent.title}</h3>
              <button
                onClick={() => setPreviewContent(null)}
                className="p-1 rounded-md text-text-muted hover:text-text-primary"
              >
                ✕
              </button>
            </div>
            <div className="p-4 rounded-xl bg-bg-elevated font-mono text-xs text-text-primary whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {previewContent.content}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setPreviewContent(null)}
                className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

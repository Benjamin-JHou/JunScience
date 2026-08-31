import React, { useState } from 'react';
import {
  FolderKanban,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  FileDown,
  ArrowRight,
  Sparkles,
  Calendar,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { useAgent } from '../../context/AgentContext';
import { useNav } from '../../context/NavContext';

export const SessionsView: React.FC = () => {
  const { sessions, openSession, renameSession, deleteSession, exportSession, resetSession } = useAgent();
  const { setActiveSection } = useNav();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartRename = (id: string, currentTitle: string) => {
    setEditingSessionId(id);
    setEditingTitle(currentTitle);
  };

  const handleSaveRename = async (id: string) => {
    if (editingTitle.trim()) {
      await renameSession(id, editingTitle.trim());
    }
    setEditingSessionId(null);
  };

  const handleCancelRename = () => {
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const handleDelete = async (id: string) => {
    await deleteSession(id);
    setConfirmDeleteId(null);
  };

  const handleExport = async (id: string) => {
    const md = await exportSession(id);
    // Create download blob
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JunScience_Report_${id}.md`;
    a.click();
    URL.revokeObjectURL(url);

    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
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
              <FolderKanban size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">Research Sessions</h2>
              <p className="text-sm text-text-secondary mt-0.5">
                Local, persistent investigation records and verified scientific findings.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleStartNew}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Sparkles size={14} />
            <span>New Research</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex items-center justify-between gap-4 my-6">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Filter sessions by title or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-bg-surface border border-border focus:border-accent focus:ring-1 focus:ring-accent text-xs text-text-primary placeholder:text-text-muted transition-all"
          />
        </div>

        <span className="text-xs font-mono text-text-muted">
          {filteredSessions.length} {filteredSessions.length === 1 ? 'session' : 'sessions'} stored
        </span>
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-bg-surface border border-border border-dashed space-y-4 my-8">
          <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
            <FolderKanban size={24} />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-semibold text-text-primary">
              {searchQuery ? 'No matching research sessions' : 'No research sessions recorded yet'}
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {searchQuery
                ? `No sessions matched "${searchQuery}". Try a different keyword.`
                : 'All your scientific investigations, tool executions, and generated manuscripts will be saved here.'}
            </p>
          </div>
          {!searchQuery && (
            <button
              onClick={handleStartNew}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors shadow-sm"
            >
              <Sparkles size={14} />
              <span>Launch First Research Inquiry</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => {
            const isEditing = editingSessionId === session.id;
            const isConfirmingDelete = confirmDeleteId === session.id;
            const messageCount = session.messages?.length || 0;
            const agentTurns = session.messages?.filter((m) => m.role === 'agent').length || 0;

            return (
              <div
                key={session.id}
                className="group p-4 rounded-xl bg-bg-surface border border-border hover:border-accent/40 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0 text-left space-y-1.5">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        autoFocus
                        className="flex-1 px-2.5 py-1 text-sm font-semibold rounded-lg bg-bg-elevated border border-accent text-text-primary focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveRename(session.id)}
                        className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                        title="Save title"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={handleCancelRename}
                        className="p-1.5 rounded-md bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3
                        onClick={() => {
                          openSession(session.id);
                          setActiveSection('home');
                        }}
                        className="text-[14.5px] font-semibold text-text-primary hover:text-accent cursor-pointer transition-colors truncate"
                      >
                        {session.title}
                      </h3>
                      <button
                        onClick={() => handleStartRename(session.id, session.title)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-bg-hover text-text-muted hover:text-text-primary transition-all"
                        title="Rename title"
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-[11.5px] text-text-muted">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock size={12} />
                      <span>{new Date(session.updatedAt || session.createdAt).toLocaleDateString()} {new Date(session.updatedAt || session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={12} />
                      <span>{agentTurns} {agentTurns === 1 ? 'synthesis turn' : 'synthesis turns'}</span>
                    </span>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-accent/90 bg-accent/5 px-1.5 py-0.5 rounded border border-accent/10">
                      {session.id}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {isConfirmingDelete ? (
                    <div className="flex items-center gap-2 p-1 rounded-lg bg-rose-500/10 border border-rose-500/30">
                      <span className="text-xs text-rose-500 font-medium px-2">Confirm delete?</span>
                      <button
                        onClick={() => handleDelete(session.id)}
                        className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="p-1 rounded text-text-muted hover:text-text-primary"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleExport(session.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:border-accent/40 bg-bg-elevated hover:bg-bg-hover text-text-secondary hover:text-text-primary text-xs font-medium transition-all"
                        title="Export Markdown Report"
                      >
                        <FileDown size={13} />
                        <span>{copiedId === session.id ? 'Exported!' : 'Export'}</span>
                      </button>

                      <button
                        onClick={() => setConfirmDeleteId(session.id)}
                        className="p-1.5 rounded-lg border border-border hover:border-rose-500/40 bg-bg-elevated hover:bg-rose-500/10 text-text-muted hover:text-rose-500 transition-colors"
                        title="Delete Session"
                      >
                        <Trash2 size={14} />
                      </button>

                      <button
                        onClick={() => {
                          openSession(session.id);
                          setActiveSection('home');
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-colors"
                      >
                        <span>Open</span>
                        <ArrowRight size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

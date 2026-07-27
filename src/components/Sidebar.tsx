import React from 'react';
import {
  Kanban,
  ListTodo,
  FolderKanban,
  Plus,
  Sparkles,
  ChevronRight,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  currentView: 'board' | 'list';
  onViewChange: (view: 'board' | 'list') => void;
  onOpenCreateModal: () => void;
  activeProjectName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  onOpenCreateModal,
  activeProjectName = 'Sprint 24 - Product Launch',
}) => {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen sticky top-0 shrink-0 select-none z-20">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/20">
            <Kanban className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-none">
              NextPlay Hub
            </h1>
            <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">
              Workspace v2.0
            </span>
          </div>
        </div>
      </div>

      {/* Guest Session Pill */}
      <div className="px-4 py-3 bg-slate-950/50 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-200">Guest Session</span>
        </div>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
          RLS Active
        </span>
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        <button
          onClick={onOpenCreateModal}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 space-y-6 py-2">
        {/* Main Views */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 mb-1.5">
            Views
          </div>
          <nav className="space-y-0.5">
            <button
              onClick={() => onViewChange('board')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'board'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderKanban className="w-4 h-4" />
                <span>Kanban Board</span>
              </div>
              {currentView === 'board' && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </button>

            <button
              onClick={() => onViewChange('list')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'list'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ListTodo className="w-4 h-4" />
                <span>List Matrix</span>
              </div>
              {currentView === 'list' && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </button>
          </nav>
        </div>

        {/* Active Projects */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 mb-1.5">
            Active Projects
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs font-medium text-slate-200">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                <span className="truncate">{activeProjectName}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/30 text-slate-400 text-[11px] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-medium">Next Play Games</span>
        </div>
        <Settings className="w-3.5 h-3.5 hover:text-slate-200 cursor-pointer transition-colors" />
      </div>
    </aside>
  );
};

export default Sidebar;
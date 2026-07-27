import React from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  UserCheck,
  LayoutGrid,
} from 'lucide-react';

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  priorityFilter?: string;
  onPriorityFilterChange?: (priority: string) => void;
  onOpenCreateModal?: () => void;
  stats?: {
    total?: number;
    completed?: number;
    inProgress?: number;
    overdue?: number;
  };
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery = '',
  onSearchChange,
  priorityFilter = 'all',
  onPriorityFilterChange,
  stats,
}) => {
  const safeStats = {
    total: stats?.total ?? 0,
    completed: stats?.completed ?? 0,
    inProgress: stats?.inProgress ?? 0,
    overdue: stats?.overdue ?? 0,
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/90 px-6 py-3 transition-all duration-300 animate-slideDown">
      <div className="max-w-full mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Project Brand Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-sm transition-transform hover:scale-105">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Sprint 24 - Product Launch
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <UserCheck className="w-3 h-3" /> Live Board
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal">
              Linear & Asana-inspired task workspace
            </p>
          </div>
        </div>

        {/* Center: Stat Badges */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400 font-medium">Total:</span>
            <span className="font-bold text-slate-100">{safeStats.total}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-medium">Done:</span>
            <span className="font-bold text-emerald-400">{safeStats.completed}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-indigo-400 font-medium">In Progress:</span>
            <span className="font-bold text-indigo-400">{safeStats.inProgress}</span>
          </div>

          {safeStats.overdue > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span className="text-rose-400 font-medium">Overdue:</span>
              <span className="font-bold text-rose-400">{safeStats.overdue}</span>
            </div>
          )}
        </div>

        {/* Right: Search Bar & Dropdown */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative w-40 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200"
            />
          </div>

          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityFilterChange && onPriorityFilterChange(e.target.value)}
              className="appearance-none pl-7 pr-6 py-1.5 text-xs font-medium bg-slate-950/80 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer transition-all duration-200 active:scale-95"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="normal">Normal Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <Filter className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
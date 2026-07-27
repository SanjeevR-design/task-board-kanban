import React from 'react';
import {
  PieChart,
  Users,
  Tag,
  Activity,
  TrendingUp,
} from 'lucide-react';
import type { Task, TeamMember } from '../types/kanban';

interface RightPanelProps {
  tasks?: Task[];
  teamMembers?: TeamMember[];
  onSelectTagFilter?: (tag: string) => void;
  selectedTag?: string;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  tasks = [],
  teamMembers = [],
  onSelectTagFilter,
  selectedTag,
}) => {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeTeamMembers = Array.isArray(teamMembers) ? teamMembers : [];

  const totalTasks = safeTasks.length;
  const completedTasks = safeTasks.filter((t) => t?.status === 'done').length;
  const inProgressTasks = safeTasks.filter((t) => t?.status === 'in_progress').length;
  
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Extract unique tags across all tasks safely
  const allTags = Array.from(
    new Set(safeTasks.flatMap((t) => (t && Array.isArray(t.tags) ? t.tags : [])))
  );

  return (
    <aside className="w-80 bg-slate-900 border-l border-slate-800 text-slate-300 p-5 flex flex-col h-screen sticky top-0 overflow-y-auto shrink-0 select-none z-10 space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-100 tracking-tight">
            Sprint Intelligence
          </h2>
        </div>
        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
          Live Sync
        </span>
      </div>

      {/* Board Health & Progress Bar */}
      <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Sprint Completion
          </span>
          <span className="font-bold text-emerald-400">{completionPercentage}%</span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 text-center">
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-base font-extrabold text-white">{completedTasks}</div>
            <div className="text-[10px] font-medium text-slate-400">Completed</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-base font-extrabold text-indigo-400">{inProgressTasks}</div>
            <div className="text-[10px] font-medium text-slate-400">In Progress</div>
          </div>
        </div>
      </div>

      {/* Team Member Workload */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" /> Team Workload
          </span>
          <span>{safeTeamMembers.length} Members</span>
        </div>

        <div className="space-y-2">
          {safeTeamMembers.map((member) => {
            const assignedCount = safeTasks.filter((t) => t?.assignee_id === member.id).length;
            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/60 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: member.color || '#6366f1' }}
                  >
                    {member.name ? member.name.slice(0, 2).toUpperCase() : 'TM'}
                  </div>
                  <span className="text-xs font-semibold text-slate-200">
                    {member.name}
                  </span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {assignedCount} task{assignedCount === 1 ? '' : 's'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Label Tag Filters */}
      {allTags.length > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-400" /> Quick Filter Tags
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => onSelectTagFilter && onSelectTagFilter(selectedTag === tag ? '' : tag)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Activity Timeline Preview */}
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400" /> Recent Updates
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/60">
            <p className="text-slate-300 font-medium leading-tight">
              Task board real-time synchronization enabled.
            </p>
            <span className="text-[10px] text-slate-500 mt-1 block">Just now</span>
          </div>
          <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/60">
            <p className="text-slate-300 font-medium leading-tight">
              Row Level Security policies verified for guest access.
            </p>
            <span className="text-[10px] text-slate-500 mt-1 block">5m ago</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;
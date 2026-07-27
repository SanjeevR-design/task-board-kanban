import React from 'react';
import { Calendar, MessageSquare, AlertCircle, Clock, Tag } from 'lucide-react';
import type { Task } from '../types/kanban';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const getDueDateStatus = (dueDateStr?: string) => {
    if (!dueDateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: 'Overdue',
        color: 'bg-rose-500/15 text-rose-400 border-rose-500/30 ring-1 ring-rose-500/20',
        icon: <AlertCircle className="w-3 h-3 text-rose-400 animate-pulse" />,
      };
    }
    if (diffDays === 0) {
      return {
        label: 'Due Today',
        color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        icon: <Clock className="w-3 h-3 text-amber-400" />,
      };
    }
    if (diffDays === 1) {
      return {
        label: 'Due Tomorrow',
        color: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
        icon: <Calendar className="w-3 h-3 text-sky-400" />,
      };
    }
    return {
      label: new Date(dueDateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      color: 'bg-slate-800 text-slate-400 border-slate-700',
      icon: <Calendar className="w-3 h-3 text-slate-400" />,
    };
  };

  const priorityStyles = {
    low: {
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      bar: 'bg-emerald-500',
    },
    normal: {
      badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      bar: 'bg-indigo-500',
    },
    high: {
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-semibold',
      bar: 'bg-rose-500',
    },
  };

  const dueDateInfo = getDueDateStatus(task.due_date);
  const currentPriority = priorityStyles[task.priority] || priorityStyles.normal;

  return (
    <div
      onClick={() => onClick(task)}
      className="group relative bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-200 ease-out cursor-pointer backdrop-blur-sm overflow-hidden transform hover:-translate-y-1 active:scale-[0.98] animate-fadeInUp"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${currentPriority.bar} opacity-70 group-hover:opacity-100 transition-opacity`} />

      <div className="pl-1.5">
        <h4 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
          {task.title}
        </h4>

        {task.description && (
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 font-normal leading-relaxed">
            {task.description}
          </p>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
            {task.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 transition-transform group-hover:scale-105"
              >
                <Tag className="w-2.5 h-2.5 opacity-60" />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mt-3.5 pt-2.5 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border uppercase tracking-wider ${currentPriority.badge}`}>
              {task.priority}
            </span>

            {dueDateInfo && (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1 ${dueDateInfo.color}`}>
                {dueDateInfo.icon}
                {dueDateInfo.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            {task.comments_count !== undefined && task.comments_count > 0 && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded-md">
                <MessageSquare className="w-3 h-3 text-slate-400" />
                {task.comments_count}
              </span>
            )}

            {task.assignee ? (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-900 transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: task.assignee.color || '#6366f1' }}
                title={task.assignee.name}
              >
                {task.assignee.name.slice(0, 2).toUpperCase()}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
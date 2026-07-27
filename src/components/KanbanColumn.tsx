import React, { useState } from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
import { TaskCard } from './TaskCard';
import type { Task, Column, TaskStatus } from '../types/kanban';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  onDropTask: (taskId: string, targetStatus: TaskStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  onTaskClick,
  onAddTask,
  onDropTask,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onDropTask(taskId, column.id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col h-full min-w-[300px] w-80 bg-slate-900/40 rounded-2xl p-3.5 border transition-all duration-300 animate-fadeInUp ${
        isDragOver
          ? 'border-indigo-500/80 bg-indigo-500/10 ring-2 ring-indigo-500/30 scale-[1.02]'
          : 'border-slate-800/80'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-800/60 mb-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 shadow-sm"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="text-sm font-bold text-slate-100">
            {column.title}
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddTask(column.id)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all duration-150 active:scale-90 cursor-pointer"
            title="Add task to this column"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all duration-150 active:scale-90 cursor-pointer"
            title="Column options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Column Cards Drop Container */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[160px]">
        {tasks.length === 0 ? (
          <div className="h-36 border-2 border-dashed border-slate-800/80 rounded-xl flex flex-col items-center justify-center p-4 text-center transition-colors hover:border-slate-700">
            <p className="text-xs font-medium text-slate-500">
              No tasks in {column.title.toLowerCase()}
            </p>
            <button
              onClick={() => onAddTask(column.id)}
              className="mt-2 text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Task
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', task.id);
                e.dataTransfer.effectAllowed = 'move';
              }}
              className="cursor-grab active:cursor-grabbing transition-transform"
            >
              <TaskCard task={task} onClick={onTaskClick} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Calendar,
  User,
  Trash2,
  MessageSquare,
  History,
  Send,
  Clock,
  Flag,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Task, TaskStatus, TaskPriority, TeamMember, TaskComment, ActivityLog } from '../types/kanban';

interface TaskDetailDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  teamMembers: TeamMember[];
  userId?: string;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  isOpen,
  onClose,
  onUpdateStatus,
  onDeleteTask,
  teamMembers,
  userId,
}) => {
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Priority styling map using TaskPriority type
  const priorityStyles: Record<TaskPriority, string> = {
    low: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    normal: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    high: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30',
  };

  // Fetch comments and activity history for current task
  const fetchTaskDetails = useCallback(async () => {
    if (!task) return;

    try {
      // 1. Fetch comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('task_id', task.id)
        .order('created_at', { ascending: true });

      setComments(commentsData || []);

      // 2. Fetch activity logs
      const { data: logsData } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('task_id', task.id)
        .order('created_at', { ascending: false });

      setActivityLogs(logsData || []);
    } catch (err) {
      console.error('Error fetching task details:', err);
    }
  }, [task]);

  useEffect(() => {
    if (isOpen && task) {
      fetchTaskDetails();
    }
  }, [isOpen, task, fetchTaskDetails]);

  if (!isOpen || !task) return null;

  // Handle adding a new comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userId) return;

    setIsSubmittingComment(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            task_id: task.id,
            user_id: userId,
            content: newComment.trim(),
          },
        ])
        .select('*')
        .single();

      if (error) throw error;

      setComments((prev) => [...prev, data]);
      setNewComment('');

      // Log activity for comment creation
      await supabase.from('activity_logs').insert([
        {
          task_id: task.id,
          user_id: userId,
          action: 'Added a comment',
        },
      ]);
      fetchTaskDetails();
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle deleting task
  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${task.title}"?`)) return;

    setIsDeleting(true);
    try {
      await onDeleteTask(task.id);
      onClose();
    } catch (err) {
      console.error('Error deleting task:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/50 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-all">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono text-slate-400">
                TASK-{task.id.slice(0, 6).toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {task.title}
              </h2>
            </div>

            {/* Quick Status & Priority Controls Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              {/* Status Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={task.status}
                  onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
                  className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              {/* Priority Display */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Flag className="w-3 h-3" /> Priority
                </label>
                <div
                  className={`text-xs font-bold capitalize p-1.5 rounded-lg border inline-block mt-0.5 ${
                    priorityStyles[task.priority] || priorityStyles.normal
                  }`}
                >
                  {task.priority} Priority
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                {task.description || 'No description provided for this task.'}
              </p>
            </div>

            {/* Metadata Badges */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5" /> Assignee
                </span>
                {task.assignee ? (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: task.assignee.color || '#6366f1' }}
                    >
                      {task.assignee.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {task.assignee.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">
                    Unassigned ({teamMembers.length} member{teamMembers.length === 1 ? '' : 's'})
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5" /> Due Date
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {task.due_date
                    ? new Date(task.due_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'No due date'}
                </span>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Tabs: Comments vs Activity */}
            <div>
              <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`text-xs font-bold flex items-center gap-1.5 pb-2 -mb-2.5 border-b-2 transition-colors ${
                    activeTab === 'comments'
                      ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Comments ({comments.length})
                </button>

                <button
                  onClick={() => setActiveTab('activity')}
                  className={`text-xs font-bold flex items-center gap-1.5 pb-2 -mb-2.5 border-b-2 transition-colors ${
                    activeTab === 'activity'
                      ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  Activity History
                </button>
              </div>

              {/* Tab Content: Comments */}
              {activeTab === 'comments' ? (
                <div className="mt-4 space-y-4">
                  {/* Comments List */}
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {comments.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-4">
                        No comments yet. Start the conversation below!
                      </p>
                    ) : (
                      comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              Guest User
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(comment.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment Form */}
                  <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="p-2 text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl shadow-sm transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              ) : (
                /* Tab Content: Activity Logs */
                <div className="mt-4 space-y-3 max-h-64 overflow-y-auto pr-1">
                  {activityLogs.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4">
                      No activity recorded yet.
                    </p>
                  ) : (
                    activityLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-2.5 text-xs">
                        <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-slate-700 dark:text-slate-300 font-medium">
                            {log.action}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
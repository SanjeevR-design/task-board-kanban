import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Task, TeamMember, TaskStatus, TaskPriority } from '../types/kanban';

const INITIAL_MEMBERS: TeamMember[] = [
  { id: 'm1', user_id: 'guest', name: 'Alex Rivera', color: '#6366f1', created_at: new Date().toISOString() },
  { id: 'm2', user_id: 'guest', name: 'Sarah Chen', color: '#ec4899', created_at: new Date().toISOString() },
  { id: 'm3', user_id: 'guest', name: 'Marcus Vance', color: '#10b981', created_at: new Date().toISOString() },
  { id: 'm4', user_id: 'guest', name: 'Elena Rostova', color: '#f59e0b', created_at: new Date().toISOString() },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    user_id: 'guest',
    title: 'Redesign Landing Page Hero & Navigation Bar',
    description: 'Implement sleek dark mode aesthetic inspired by Linear and Asana with responsive grid cards and priority accent badges.',
    status: 'in_progress',
    priority: 'high',
    due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    assignee_id: 'm1',
    assignee: INITIAL_MEMBERS[0],
    comments_count: 3,
    tags: ['Design', 'UI/UX'],
    created_at: new Date().toISOString(),
  },
  {
    id: 't-2',
    user_id: 'guest',
    title: 'Configure Supabase Row Level Security (RLS) Policies',
    description: 'Set up guest tenant isolation policies to ensure anonymous users read and write only their private task board records.',
    status: 'done',
    priority: 'high',
    due_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    assignee_id: 'm3',
    assignee: INITIAL_MEMBERS[2],
    comments_count: 1,
    tags: ['Backend', 'Database'],
    created_at: new Date().toISOString(),
  },
  {
    id: 't-3',
    user_id: 'guest',
    title: 'Build Slide-over Task Details & Activity Feed Drawer',
    description: 'Add real-time comment discussion threads, timestamped movement logs, and interactive status selector controls.',
    status: 'in_review',
    priority: 'normal',
    due_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    assignee_id: 'm2',
    assignee: INITIAL_MEMBERS[1],
    comments_count: 2,
    tags: ['Frontend', 'React'],
    created_at: new Date().toISOString(),
  },
  {
    id: 't-4',
    user_id: 'guest',
    title: 'Audit Mobile Touch Drag & Drop Target Feedback',
    description: 'Ensure active drop zone ring glows, touch targets, and modal dialogues respond smoothly on tablet and mobile viewports.',
    status: 'todo',
    priority: 'low',
    due_date: new Date(Date.now() + 345600000).toISOString().split('T')[0],
    assignee_id: 'm4',
    assignee: INITIAL_MEMBERS[3],
    comments_count: 0,
    tags: ['QA', 'Mobile'],
    created_at: new Date().toISOString(),
  },
];

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [loading, setLoading] = useState<boolean>(false);
  const [error] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured || !userId) {
      setTasks(INITIAL_TASKS);
      setTeamMembers(INITIAL_MEMBERS);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // 2.5-second timeout guard to prevent infinite loading spinner
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Supabase request timeout')), 2500)
      );

      const fetchPromise = (async () => {
        const { data: membersData } = await supabase
          .from('team_members')
          .select('*')
          .order('created_at', { ascending: true });

        const activeMembers = (membersData && membersData.length > 0) ? membersData : INITIAL_MEMBERS;

        const { data: tasksData } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        return { activeMembers, tasksData };
      })();

      const result = (await Promise.race([fetchPromise, timeoutPromise])) as {
        activeMembers: TeamMember[];
        tasksData: Task[] | null;
      };

      setTeamMembers(result.activeMembers);

      if (result.tasksData && result.tasksData.length > 0) {
        const formattedTasks: Task[] = result.tasksData.map((t) => {
          const assignee = result.activeMembers.find((m) => m.id === t.assignee_id);
          return { ...t, assignee };
        });
        setTasks(formattedTasks);
      } else {
        setTasks(INITIAL_TASKS);
      }
    } catch (err) {
      console.warn('Supabase fetch timed out or table missing, using demo tasks fallback:', err);
      setTasks(INITIAL_TASKS);
      setTeamMembers(INITIAL_MEMBERS);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createTask = async (newTask: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date?: string;
    assignee_id?: string;
  }) => {
    const createdTask: Task = {
      id: 't-' + Date.now(),
      user_id: userId || 'guest',
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      due_date: newTask.due_date,
      assignee_id: newTask.assignee_id,
      assignee: teamMembers.find((m) => m.id === newTask.assignee_id),
      comments_count: 0,
      tags: ['New Task'],
      created_at: new Date().toISOString(),
    };

    setTasks((prev) => [createdTask, ...prev]);

    if (isSupabaseConfigured && userId) {
      try {
        await supabase.from('tasks').insert([{ ...newTask, user_id: userId }]);
        await supabase.from('activity_logs').insert([
          {
            task_id: createdTask.id,
            user_id: userId,
            action: `Created task "${newTask.title}"`,
          },
        ]);
      } catch (err) {
        console.error('Supabase write error:', err);
      }
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask || targetTask.status === newStatus) return;

    const oldStatus = targetTask.status;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    if (isSupabaseConfigured && userId) {
      try {
        await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
        const statusNames: Record<TaskStatus, string> = {
          todo: 'To Do',
          in_progress: 'In Progress',
          in_review: 'In Review',
          done: 'Done',
        };
        await supabase.from('activity_logs').insert([
          {
            task_id: taskId,
            user_id: userId,
            action: `Moved from ${statusNames[oldStatus]} to ${statusNames[newStatus]}`,
          },
        ]);
      } catch (err) {
        console.error('Error updating task status:', err);
      }
    }
  };

  const deleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (isSupabaseConfigured && userId) {
      try {
        await supabase.from('tasks').delete().eq('id', taskId);
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }
  };

  return {
    tasks,
    teamMembers,
    loading,
    error,
    createTask,
    updateTaskStatus,
    deleteTask,
    refreshTasks: fetchData,
  };
}
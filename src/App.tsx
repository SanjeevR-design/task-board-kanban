import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { RightPanel } from './components/RightPanel';
import { KanbanColumn } from './components/KanbanColumn';
import { CreateTaskModal } from './components/CreateTaskModal';
import { TaskDetailDrawer } from './components/TaskDetailDrawer';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import type { Column, Task, TaskStatus } from './types/kanban';
import { Loader2, AlertCircle } from 'lucide-react';

const COLUMNS: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    color: '#3b82f6',
    bgLight: 'bg-blue-500/10',
    borderLight: 'border-blue-500/20',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    color: '#8b5cf6',
    bgLight: 'bg-purple-500/10',
    borderLight: 'border-purple-500/20',
  },
  {
    id: 'in_review',
    title: 'In Review',
    color: '#f59e0b',
    bgLight: 'bg-amber-500/10',
    borderLight: 'border-amber-500/20',
  },
  {
    id: 'done',
    title: 'Done',
    color: '#10b981',
    bgLight: 'bg-emerald-500/10',
    borderLight: 'border-emerald-500/20',
  },
];

export function App() {
  const { user, loading: authLoading } = useAuth();
  const {
    tasks = [],
    teamMembers = [],
    loading: tasksLoading,
    error,
    createTask,
    updateTaskStatus,
    deleteTask,
  } = useTasks(user?.id);

  // View States
  const [currentView, setCurrentView] = useState<'board' | 'list'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState('');

  // Modals & Panel States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createInitialStatus, setCreateInitialStatus] = useState<TaskStatus>('todo');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Defensive array checks
  const safeTasks = useMemo(() => (Array.isArray(tasks) ? tasks : []), [tasks]);
  const safeTeamMembers = useMemo(
    () => (Array.isArray(teamMembers) ? teamMembers : []),
    [teamMembers]
  );

  // Check Overdue Task Helper
  const isTaskOverdue = (dueDateStr?: string, status?: TaskStatus) => {
    if (!dueDateStr || status === 'done') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    return due.getTime() < today.getTime();
  };

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return safeTasks.filter((task) => {
      if (!task) return false;
      const matchesSearch =
        searchQuery.trim() === '' ||
        (task.title && task.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority =
        priorityFilter === 'all' || task.priority === priorityFilter;

      const matchesTag =
        !selectedTagFilter || (task.tags && task.tags.includes(selectedTagFilter));

      return matchesSearch && matchesPriority && matchesTag;
    });
  }, [safeTasks, searchQuery, priorityFilter, selectedTagFilter]);

  // Board Stats Metrics
  const stats = useMemo(() => {
    const total = safeTasks.length;
    const completed = safeTasks.filter((t) => t?.status === 'done').length;
    const inProgress = safeTasks.filter((t) => t?.status === 'in_progress').length;
    const overdue = safeTasks.filter((t) => isTaskOverdue(t?.due_date, t?.status)).length;

    return { total, completed, inProgress, overdue };
  }, [safeTasks]);

  // Handlers
  const handleOpenCreateModal = (status: TaskStatus = 'todo') => {
    setCreateInitialStatus(status);
    setIsCreateModalOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    if (updateTaskStatus) {
      await updateTaskStatus(taskId, newStatus);
    }
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (deleteTask) {
      await deleteTask(taskId);
    }
    if (selectedTask?.id === taskId) {
      setIsDrawerOpen(false);
      setSelectedTask(null);
    }
  };

  return (
    <div className="dark bg-slate-950 text-slate-100 min-h-screen flex font-sans antialiased selection:bg-indigo-500 selection:text-white animate-fadeIn">
      {/* 1. Left Navigation Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenCreateModal={() => handleOpenCreateModal('todo')}
      />

      {/* 2. Main Content Center Stage */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-950">
        {/* Top Header Bar */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          onOpenCreateModal={() => handleOpenCreateModal('todo')}
          stats={stats}
        />

        {/* Board Main Area */}
        <main className="flex-1 p-6 overflow-hidden flex flex-col">
          {authLoading || tasksLoading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400 animate-fadeIn">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-xs font-semibold tracking-wide">
                Loading task workspace...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3 my-8 animate-scaleIn">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs font-medium">{error}</p>
            </div>
          ) : currentView === 'board' ? (
            /* Kanban Board Columns Container with Thin Custom Scrollbar */
            <div className="flex gap-5 h-full items-start overflow-x-auto pb-3 pt-1 scrollbar-thin">
              {COLUMNS.map((col) => {
                const columnTasks = filteredTasks.filter((t) => t?.status === col.id);
                return (
                  <KanbanColumn
                    key={col.id}
                    column={col}
                    tasks={columnTasks}
                    onTaskClick={handleTaskClick}
                    onAddTask={handleOpenCreateModal}
                    onDropTask={handleUpdateStatus}
                  />
                );
              })}
            </div>
          ) : (
            /* List View Matrix */
            <div className="max-w-5xl mx-auto space-y-3 overflow-y-auto h-full pr-2 animate-fadeInUp scrollbar-thin">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
                All Tasks Matrix ({filteredTasks.length})
              </h2>
              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs rounded-xl bg-slate-900/50 border border-slate-800">
                  No tasks found matching current filters.
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className="p-4 bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                      <span className="text-sm font-semibold text-slate-100 truncate">
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 font-mono text-slate-300 uppercase">
                        {task.status ? task.status.replace('_', ' ') : 'TODO'}
                      </span>
                      <span className="px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-400 font-bold uppercase">
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {/* 3. Right Side Analytics & Activity Panel */}
      <RightPanel
        tasks={safeTasks}
        teamMembers={safeTeamMembers}
        selectedTag={selectedTagFilter}
        onSelectTagFilter={setSelectedTagFilter}
      />

      {/* Create Task Modal Dialogue */}
      {createTask && (
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={createTask}
          initialStatus={createInitialStatus}
          teamMembers={safeTeamMembers}
        />
      )}

      {/* Slide-over Detail Panel */}
      <TaskDetailDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateStatus={handleUpdateStatus}
        onDeleteTask={handleDeleteTask}
        teamMembers={safeTeamMembers}
        userId={user?.id}
      />
    </div>
  );
}

export default App;

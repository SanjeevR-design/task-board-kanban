export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'normal' | 'high';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  assignee_id?: string;
  created_at: string;
  // Joined fields
  assignee?: TeamMember;
  comments_count?: number;
  tags?: string[];
}

export interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  color: string;
  created_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
}

export interface ActivityLog {
  id: string;
  task_id: string;
  user_id: string;
  action: string;
  created_at: string;
}

export interface Column {
  id: TaskStatus;
  title: string;
  color: string;
  bgLight: string;
  borderLight: string;
}
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  password?: string;
  role?: 'admin' | 'user';
  updatedAt?: Date;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  members: User[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assigneeId?: string;
  assignee?: User;
  reporterId: string;
  reporter: User;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  estimatedHours?: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: User;
  taskId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'lowest' | 'low' | 'medium' | 'high' | 'highest';
export type TaskType = 'story' | 'task' | 'bug' | 'epic';

export interface BoardColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}
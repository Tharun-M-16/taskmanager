import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Task, TaskPriority, TaskType } from '../../types';
import { 
  AlertCircle, 
  Bug, 
  CheckSquare, 
  Circle, 
  Clock,
  MessageCircle,
  User
} from 'lucide-react';
import clsx from 'clsx';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  className?: string;
}

const priorityIcons = {
  highest: { icon: AlertCircle, color: 'text-red-600' },
  high: { icon: AlertCircle, color: 'text-orange-500' },
  medium: { icon: AlertCircle, color: 'text-yellow-500' },
  low: { icon: AlertCircle, color: 'text-green-500' },
  lowest: { icon: AlertCircle, color: 'text-gray-400' },
};

const typeIcons = {
  story: { icon: CheckSquare, color: 'text-green-600' },
  task: { icon: CheckSquare, color: 'text-blue-600' },
  bug: { icon: Bug, color: 'text-red-600' },
  epic: { icon: Circle, color: 'text-purple-600' },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, className }) => {
  const PriorityIcon = priorityIcons[task.priority].icon;
  const TypeIcon = typeIcons[task.type].icon;

  return (
    <div
      className={clsx(
        'glass rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer hover-lift border border-white/10',
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <TypeIcon className={clsx('w-4 h-4', typeIcons[task.type].color)} />
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {task.type}
          </span>
        </div>
        <PriorityIcon className={clsx('w-4 h-4', priorityIcons[task.priority].color)} />
      </div>

      {/* Title */}
      <h3 className="font-medium text-white mb-2 line-clamp-2 text-sm">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-3">
          {task.assignee && (
            <div className="flex items-center space-x-2">
              {task.assignee.avatar ? (
                <img
                  src={task.assignee.avatar}
                  alt={task.assignee.name}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-indigo-500/30"
                />
              ) : (
                <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
              )}
              <span className="max-w-20 truncate text-gray-300">{task.assignee.name}</span>
            </div>
          )}
          
          {task.comments.length > 0 && (
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-3 h-3" />
              <span>{task.comments.length}</span>
            </div>
          )}
          
          {task.estimatedHours && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{task.estimatedHours}h</span>
            </div>
          )}
        </div>
        
        <span className="text-gray-500">{formatDistanceToNow(task.updatedAt, { addSuffix: true })}</span>
      </div>

      {/* Due date */}
      {task.dueDate && (
        <div className={clsx(
          'mt-3 text-xs px-2 py-1 rounded-lg',
          task.dueDate < new Date() 
            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
            : 'bg-slate-800/50 text-gray-400 border border-slate-700/50'
        )}>
          Due {formatDistanceToNow(task.dueDate, { addSuffix: true })}
        </div>
      )}
    </div>
  );
};
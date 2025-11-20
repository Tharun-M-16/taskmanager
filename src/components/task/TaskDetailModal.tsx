import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useApp } from '../../contexts/AppContext';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { 
  Clock, 
  MessageCircle, 
  Trash2, 
  User, 
  Calendar,
  Send
} from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose }) => {
  const { updateTask, deleteTask, addComment, currentUser, currentProject } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editData, setEditData] = useState<Partial<Task>>({});

  if (!task) return null;

  const handleUpdate = () => {
    updateTask(task.id, editData);
    setIsEditing(false);
    setEditData({});
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
      onClose();
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    addComment(task.id, commentText);
    setCommentText('');
  };

  const statusOptions: { value: TaskStatus; label: string }[] = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' }
  ];

  const priorityOptions: { value: TaskPriority; label: string }[] = [
    { value: 'lowest', label: 'Lowest' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'highest', label: 'Highest' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.title} size="xl">
      <div className="grid grid-cols-3 gap-6">
        {/* Main content */}
        <div className="col-span-2 space-y-6">
          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
            {isEditing ? (
              <textarea
                value={editData.description ?? task.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-600">{task.description || 'No description provided'}</p>
            )}
          </div>

          {/* Comments */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <MessageCircle className="w-4 h-4 text-gray-400" />
              <h4 className="text-sm font-medium text-gray-900">
                Comments ({task.comments.length})
              </h4>
            </div>

            {/* Add comment */}
            {currentUser && (
              <form onSubmit={handleAddComment} className="mb-4">
                <div className="flex space-x-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="mt-2 flex justify-end">
                      <Button type="submit" size="sm" disabled={!commentText.trim()}>
                        <Send className="w-3 h-3 mr-1" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Comments list */}
            <div className="space-y-4">
              {task.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-md p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.author.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="space-y-2">
            {isEditing ? (
              <>
                <Button onClick={handleUpdate} className="w-full">
                  Save Changes
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => setIsEditing(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="w-full">
                Edit Task
              </Button>
            )}
            <Button variant="danger" onClick={handleDelete} className="w-full">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Task
            </Button>
          </div>

          {/* Task details */}
          <div className="space-y-4">
            {/* Status */}
            <div>
              <label className="text-sm font-medium text-gray-900">Status</label>
              {isEditing ? (
                <select
                  value={editData.status ?? task.status}
                  onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-gray-600 capitalize">{task.status.replace('-', ' ')}</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm font-medium text-gray-900">Priority</label>
              {isEditing ? (
                <select
                  value={editData.priority ?? task.priority}
                  onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-gray-600 capitalize">{task.priority}</p>
              )}
            </div>

            {/* Assignee */}
            <div>
              <label className="text-sm font-medium text-gray-900">Assignee</label>
              {isEditing ? (
                <select
                  value={editData.assigneeId ?? task.assigneeId ?? ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, assigneeId: e.target.value || undefined }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Unassigned</option>
                  {currentProject?.members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center space-x-2 mt-1">
                  {task.assignee ? (
                    <>
                      <img
                        src={task.assignee.avatar}
                        alt={task.assignee.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-sm text-gray-600">{task.assignee.name}</span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">Unassigned</span>
                  )}
                </div>
              )}
            </div>

            {/* Reporter */}
            <div>
              <label className="text-sm font-medium text-gray-900">Reporter</label>
              <div className="flex items-center space-x-2 mt-1">
                <img
                  src={task.reporter.avatar}
                  alt={task.reporter.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-sm text-gray-600">{task.reporter.name}</span>
              </div>
            </div>

            {/* Estimated Hours */}
            {task.estimatedHours && (
              <div>
                <label className="text-sm font-medium text-gray-900">Estimated Hours</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{task.estimatedHours}h</span>
                </div>
              </div>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <div>
                <label className="text-sm font-medium text-gray-900">Due Date</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {task.dueDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1">
              <div>Created {formatDistanceToNow(task.createdAt, { addSuffix: true })}</div>
              <div>Updated {formatDistanceToNow(task.updatedAt, { addSuffix: true })}</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
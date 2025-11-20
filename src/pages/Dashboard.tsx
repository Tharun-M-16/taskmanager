import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import {
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  TrendingUp
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Dashboard: React.FC = () => {
  const { tasks, currentProject, createProject, currentUser } = useApp();
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== 'done').length,
    highPriority: tasks.filter(t => t.priority === 'high' || t.priority === 'highest').length
  };

  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !currentUser) return;
    setCreateError('');
    setCreating(true);
    try {
      const baseKey = projectName.trim().replace(/[^A-Za-z0-9]/g, '').substring(0, 4).toUpperCase() || 'PRJ';
      let attempt = 0;
      let ok = false;
      let lastMessage = '';
      while (attempt < 3 && !ok) {
        const key = attempt === 0 ? baseKey : `${baseKey}${attempt + 1}`;
        const result = await createProject({
          name: projectName.trim(),
          key,
          description: 'New project',
          ownerId: currentUser.id,
          members: [currentUser]
        });
        ok = result.ok;
        lastMessage = result.message || '';
        if (!ok && /key.*exists|already exists/i.test(lastMessage || '')) {
          attempt += 1;
        } else if (!ok) {
          break;
        }
      }
      if (!ok) {
        setCreateError(lastMessage || 'Failed to create project');
        return;
      }
      setProjectName('');
      setShowCreateProject(false);
    } finally {
      setCreating(false);
    }
  };

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: BarChart3,
      color: 'text-blue-400',
      bgColor: 'bg-gradient-to-br from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30'
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/20',
      borderColor: 'border-yellow-500/30'
    },
    {
      title: 'High Priority',
      value: stats.highPriority,
      icon: AlertCircle,
      color: 'text-red-400',
      bgColor: 'bg-gradient-to-br from-red-500/20 to-red-600/20',
      borderColor: 'border-red-500/30'
    },
    {
      title: 'Completed',
      value: stats.done,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-gradient-to-br from-green-500/20 to-green-600/20',
      borderColor: 'border-green-500/30'
    },
    {
      title: 'Team Members',
      value: currentProject?.members?.length || 0,
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-gradient-to-br from-purple-500/20 to-purple-600/20',
      borderColor: 'border-purple-500/30'
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: 'text-indigo-400',
      bgColor: 'bg-gradient-to-br from-indigo-500/20 to-indigo-600/20',
      borderColor: 'border-indigo-500/30'
    }
  ];

  const recentTasks = tasks
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Dashboard
        </h1>
        {currentProject ? (
          <p className="text-gray-200 text-lg">
            Project overview for <span className="font-medium text-white">{currentProject.name}</span>
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-200 text-lg">Welcome to TaskFlow! Get started by creating your first project.</p>
            <Button onClick={() => setShowCreateProject(true)} className="btn-primary">
              Create Your First Project
            </Button>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass rounded-2xl p-8 max-w-md w-full mx-4 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button type="button" variant="secondary" onClick={() => setShowCreateProject(false)}>
                  Cancel
                </Button>
                {createError && (
                  <p className="text-red-400 text-sm mr-auto">{createError}</p>
                )}
                <Button type="submit" disabled={!projectName.trim() || creating}>
                  {creating ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className={`glass rounded-2xl p-6 hover-lift border ${stat.borderColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-200 mb-2">{stat.title}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor} border ${stat.borderColor}`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Status Breakdown */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Task Status</h3>
          <div className="space-y-4">
            {[
              { label: 'To Do', count: stats.todo, color: 'bg-gray-400' },
              { label: 'In Progress', count: stats.inProgress, color: 'bg-blue-500' },
              { label: 'Review', count: stats.review, color: 'bg-yellow-500' },
              { label: 'Done', count: stats.done, color: 'bg-green-500' }
            ].map(status => (
              <div key={status.label} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/30 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${status.color}`} />
                  <span className="text-sm text-gray-200">{status.label}</span>
                </div>
                <span className="text-sm font-medium text-white">{status.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Recent Tasks</h3>
          <div className="space-y-3">
            {recentTasks.length > 0 ? (
              recentTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-slate-800/30 transition-all duration-200">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-300 capitalize">
                      {task.status.replace('-', ' ')} • {task.priority} priority
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-3">
                    {task.assignee?.avatar ? (
                      <img
                        src={task.assignee.avatar}
                        alt={task.assignee.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/50"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-800/80 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-300">No tasks yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {stats.overdue > 0 && (
        <div className="glass rounded-2xl p-6 border border-red-500/30">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mr-4">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-1">Overdue Tasks</h4>
              <p className="text-red-300">
                You have {stats.overdue} overdue task{stats.overdue > 1 ? 's' : ''} that need attention.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
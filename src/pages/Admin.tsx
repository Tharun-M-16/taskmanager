import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { AdminLayout } from '../components/layout/AdminLayout';
import { User, Project, Task } from '../types';
import { 
  Users, 
  FolderOpen, 
  CheckSquare, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  Edit,
  Trash2,
  Shield,
  User as UserIcon,
  
  Globe,
  Lock,
  Bell,
  Palette
} from 'lucide-react';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (userId: string, updates: Partial<User>) => Promise<{ ok: boolean; message?: string }>;
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ ok: boolean; message?: string }>;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role || 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await onUpdate(user.id, formData);
      if (result.ok) {
        onClose();
      } else {
        setError(result.message || 'Failed to update user');
      }
    } catch {
      setError('An error occurred while updating user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'user' }))}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            disabled={loading}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {error && (
          <div className="text-sm text-red-400 bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-center">
            {error}
          </div>
        )}
        <div className="flex justify-end space-x-3 pt-6">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onCreate }) => {
  const { users } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    ownerId: users[0]?.id || '',
    members: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await onCreate(formData);
      if (result.ok) {
        onClose();
        setFormData({ name: '', key: '', description: '', ownerId: users[0]?.id || '', members: [] });
      } else {
        setError(result.message || 'Failed to create project');
      }
    } catch {
      setError('An error occurred while creating project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Project Key</label>
          <input
            type="text"
            value={formData.key}
            onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value.toUpperCase() }))}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            required
            maxLength={10}
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            rows={3}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Project Owner</label>
          <select
            value={formData.ownerId}
            onChange={(e) => setFormData(prev => ({ ...prev, ownerId: e.target.value }))}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            required
            disabled={loading}
          >
            {users.map((user: User) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
        {error && (
          <div className="text-sm text-red-400 bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-center">
            {error}
          </div>
        )}
        <div className="flex justify-end space-x-3 pt-6">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

type AdminTab = 'dashboard' | 'users' | 'projects' | 'tasks' | 'system' | 'analytics';

export const Admin: React.FC = () => {
  const {
    users,
    visitCount,
    projects,
    allTasks,
    currentUser,
    updateUser,
    deleteUser,
    createProject,
    loading,
    refreshData,
    adminProjects,
    adminTasks,
    deleteProject,
    deleteTask,
    updateProject,
    updateTask
  } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  // Ensure data is fresh when visiting Admin and when switching tabs
  useEffect(() => {
    refreshData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Calculate analytics
  const totalUsers = users.length;
  const adminUsers = users.filter((u: User) => u.role === 'admin').length;
  const totalProjects = projects.length;
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t: Task) => t.status === 'done').length;
  const overdueTasks = allTasks.filter((t: Task) => t.dueDate && t.dueDate < new Date() && t.status !== 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    return await updateUser(userId, updates);
  };

  const handleDeleteUser = async (userId: string) => {
    setDeleteLoading(true);
    try {
      const result = await deleteUser(userId);
      if (result.ok) {
        setShowDeleteConfirm(null);
      } else {
        // Handle error - you might want to show a toast notification
        console.error('Failed to delete user:', result.message);
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await createProject(projectData);
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <div className="glass rounded-2xl p-12 max-w-md mx-auto">
          <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }



  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="p-8 text-center text-gray-300">Loading admin data...</div>
      );
    }
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass rounded-2xl p-6 hover-lift">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl border border-blue-500/30">
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Total Users</p>
                    <p className="text-3xl font-bold text-white">{totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 hover-lift">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl border border-green-500/30">
                    <FolderOpen className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Total Projects</p>
                    <p className="text-3xl font-bold text-white">{totalProjects}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 hover-lift">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl border border-purple-500/30">
                    <CheckSquare className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Total Tasks</p>
                    <p className="text-3xl font-bold text-white">{totalTasks}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 hover-lift">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl border border-orange-500/30">
                    <TrendingUp className="w-8 h-8 text-orange-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Completion Rate</p>
                    <p className="text-3xl font-bold text-white">{completionRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass rounded-2xl p-6 hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Completed Tasks</p>
                    <p className="text-3xl font-bold text-green-400">{completedTasks}</p>
                  </div>
                  <CheckSquare className="w-10 h-10 text-green-500" />
                </div>
              </div>

              <div className="glass rounded-2xl p-6 hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Overdue Tasks</p>
                    <p className="text-3xl font-bold text-red-400">{overdueTasks}</p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
              </div>

              <div className="glass rounded-2xl p-6 hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Page Visits</p>
                    <p className="text-3xl font-bold text-blue-400">{visitCount}</p>
                  </div>
                  <Clock className="w-10 h-10 text-blue-500" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">User Management</h2>
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-indigo-400" />
                <span className="text-sm text-gray-400">{adminUsers} admins</span>
              </div>
            </div>
            
            <div className="glass rounded-2xl overflow-hidden">
              <div className="divide-y divide-white/10">
                {users.map((user: User) => (
                  <div key={user.id} className="p-6 flex items-center justify-between hover:bg-slate-800/30 transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/30" />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-3">
                          <p className="text-lg font-medium text-white">{user.name}</p>
                          {user.role === 'admin' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingUser(user)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      {user.id !== currentUser.id && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setShowDeleteConfirm(user.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Project Control</h2>
              <Button onClick={() => setShowCreateProject(true)}>
                <FolderOpen className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
            
            <div className="glass rounded-2xl overflow-hidden">
              <div className="divide-y divide-white/10">
                {(adminProjects && adminProjects.length ? adminProjects : projects).map((project: Project) => (
                  <div key={project.id} className="p-6 flex items-center justify-between hover:bg-slate-800/30 transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <FolderOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <p className="text-lg font-medium text-white">{project.name}</p>
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                            {project.key}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{project.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{project.members.length} members</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Button variant="secondary" size="sm" onClick={async () => {
                        const newName = window.prompt('Project name', project.name);
                        if (newName === null) return; // cancelled
                        const newDescription = window.prompt('Description', project.description || '');
                        if (newDescription === null) return;
                        const res = await updateProject(project.id, { name: newName, description: newDescription });
                        if (!res.ok) console.error('Failed to update project', res.message);
                        else await refreshData();
                      }}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={async () => {
                        const ok = window.confirm(`Delete project "${project.name}"? This cannot be undone.`);
                        if (!ok) return;
                        const res = await deleteProject(project.id);
                        if (!res.ok) console.error('Failed to delete project', res.message);
                        else await refreshData();
                      }}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Task Management</h2>
              <Button>
                <CheckSquare className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </div>
            
            <div className="glass rounded-2xl overflow-hidden">
              <div className="divide-y divide-white/10">
                {(adminTasks && adminTasks.length ? adminTasks : allTasks).slice(0, 50).map((task: Task) => (
                  <div key={task.id} className="p-6 flex items-center justify-between hover:bg-slate-800/30 transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        task.priority === 'highest' ? 'bg-red-500' :
                        task.priority === 'high' ? 'bg-orange-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' :
                        task.priority === 'low' ? 'bg-blue-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <p className="text-lg font-medium text-white">{task.title}</p>
                        <p className="text-sm text-gray-400">{task.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            task.status === 'done' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            task.status === 'review' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}>
                            {task.status}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            task.type === 'bug' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            task.type === 'story' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            task.type === 'epic' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                            'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}>
                            {task.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Button variant="secondary" size="sm" onClick={async () => {
                        const newTitle = window.prompt('Task title', task.title);
                        if (newTitle === null) return;
                        const newDescription = window.prompt('Task description', task.description || '');
                        if (newDescription === null) return;
                        const newStatus = window.prompt('Status (todo/in-progress/review/done)', task.status || 'todo');
                        if (newStatus === null) return;
                        const res = await updateTask(task.id, { title: newTitle, description: newDescription, status: newStatus as Task['status'] });
                        if (!res.ok) console.error('Failed to update task', res.message);
                        else await refreshData();
                      }}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" onClick={async () => {
                        const ok = window.confirm(`Delete task "${task.title}"? This cannot be undone.`);
                        if (!ok) return;
                        const res = await deleteTask(task.id);
                        if (!res.ok) console.error('Failed to delete task', res.message);
                        else await refreshData();
                      }}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-white">System Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Globe className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-medium text-white">General Settings</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Site Name</span>
                    <input 
                      type="text" 
                      defaultValue="Project Bolt" 
                      className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded text-white text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Maintenance Mode</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Lock className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-medium text-white">Security</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Session Timeout</span>
                    <select className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded text-white text-sm">
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>4 hours</option>
                      <option>24 hours</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Two-Factor Auth</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Bell className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-lg font-medium text-white">Notifications</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Email Notifications</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Push Notifications</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Palette className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-medium text-white">Appearance</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Theme</span>
                    <select className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded text-white text-sm">
                      <option>Dark</option>
                      <option>Light</option>
                      <option>Auto</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Accent Color</span>
                    <select className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded text-white text-sm">
                      <option>Blue</option>
                      <option>Green</option>
                      <option>Purple</option>
                      <option>Orange</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="secondary">Reset to Defaults</Button>
              <Button>Save Settings</Button>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-white">Advanced Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-medium text-white mb-4">User Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Active Users (24h)</span>
                    <span className="text-white font-semibold">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">New Users (7d)</span>
                    <span className="text-white font-semibold">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">User Retention</span>
                    <span className="text-white font-semibold">78%</span>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-medium text-white mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Avg Response Time</span>
                    <span className="text-white font-semibold">120ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Uptime</span>
                    <span className="text-white font-semibold">99.9%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Error Rate</span>
                    <span className="text-white font-semibold">0.1%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-medium text-white mb-4">Recent Activity Log</h3>
              <div className="space-y-3">
                {[
                  { action: 'User login', user: 'john.doe@example.com', time: '2 minutes ago', type: 'info' },
                  { action: 'Project created', user: 'jane.smith@example.com', time: '15 minutes ago', type: 'success' },
                  { action: 'Task completed', user: 'mike.johnson@example.com', time: '1 hour ago', type: 'success' },
                  { action: 'User role changed', user: 'admin@example.com', time: '2 hours ago', type: 'warning' }
                ].map((log: { action: string; user: string; time: string; type: string }, index: number) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      log.type === 'success' ? 'bg-green-500' :
                      log.type === 'warning' ? 'bg-yellow-500' :
                      log.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-white">{log.action}</span>
                    <span className="text-gray-400">by {log.user}</span>
                    <span className="text-gray-500 ml-auto">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as AdminTab)}>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Admin Control Panel
          </h1>
          <p className="text-gray-200 text-lg">Complete website administration and management</p>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {renderTabContent()}
        </div>

        {/* Modals */}
        {editingUser && (
          <EditUserModal
            isOpen={!!editingUser}
            onClose={() => setEditingUser(null)}
            user={editingUser}
            onUpdate={handleUpdateUser}
          />
        )}

        {showCreateProject && (
          <CreateProjectModal
            isOpen={showCreateProject}
            onClose={() => setShowCreateProject(false)}
            onCreate={handleCreateProject}
          />
        )}

        {showDeleteConfirm && (
          <Modal isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} title="Confirm Delete">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Delete User</h3>
                <p className="text-gray-400">
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)} disabled={deleteLoading}>
                  Cancel
                </Button>
                <Button 
                  variant="danger" 
                  onClick={() => handleDeleteUser(showDeleteConfirm!)}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete User'}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
};



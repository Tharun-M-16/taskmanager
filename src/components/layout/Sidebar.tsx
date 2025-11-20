import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/Button';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  FolderOpen, 
  Settings, 
  Shield,
  Plus,
  X
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentUser, currentProject, createProject, projects, setCurrentProject } = useApp() as any;
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const hasProjectSelected = Boolean(currentProject);
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, disabled: false },
    { name: 'Board', href: '/board', icon: CheckSquare, disabled: !hasProjectSelected },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare, disabled: !hasProjectSelected },
    { name: 'Team', href: '/team', icon: Users, disabled: !hasProjectSelected },
    { name: 'Projects', href: '/projects', icon: FolderOpen, disabled: false },
    ...(currentUser?.role === 'admin' ? [{ name: 'Admin', href: '/admin', icon: Shield, disabled: false }] : []),
    { name: 'Settings', href: '/settings', icon: Settings, disabled: false },
  ];

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    if (!projectName.trim()) return;
    try {
      setCreating(true);
      // try with base key, then retry with suffix if key exists
      const baseKey = projectName.trim().replace(/[^A-Za-z0-9]/g, '').substring(0, 4).toUpperCase() || 'PRJ';
      let attempt = 0;
      let ok = false;
      let lastMessage = '';
      while (attempt < 3 && !ok) {
        const key = attempt === 0 ? baseKey : `${baseKey}${attempt + 1}`;
        const result = await createProject({
          name: projectName.trim(),
          key,
          description: projectDescription.trim() || 'New project',
          ownerId: currentUser?.id || '1',
          members: currentUser ? [currentUser] : []
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
      setProjectDescription('');
      setShowCreateProject(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div className="w-64 bg-slate-900/95 backdrop-blur-md border-r border-white/20 flex flex-col">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center glow">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                TaskFlow
              </h1>
              <p className="text-xs text-gray-300">Project Management</p>
            </div>
          </div>
        </div>

        {/* Project Switcher */}
        <div className="p-4 border-b border-white/20">
          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/80">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-white">Projects</h3>
              <button 
                onClick={() => setShowCreateProject(true)}
                className="p-1 hover:bg-slate-700/80 rounded transition-colors"
              >
                <Plus className="w-4 h-4 text-gray-300 hover:text-white" />
              </button>
            </div>
            {(projects && projects.length > 0) ? (
              <div className="space-y-1 max-h-48 overflow-auto">
                {projects.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => setCurrentProject(p)}
                    className={`w-full text-left px-2 py-1.5 rounded-md transition-colors ${
                      currentProject && currentProject.id === p.id
                        ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40'
                        : 'text-gray-200 hover:text-white hover:bg-slate-700/60'
                    }`}
                    title={p.description}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{p.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{p.key}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No projects yet. Create one.</p>
            )}
          </div>
        </div>

        {/* Create Project Button (when no current project) */}
        {!currentProject && (
          <div className="p-4 border-b border-white/20">
            <Button 
              onClick={() => setShowCreateProject(true)}
              className="w-full btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover-lift ${
                    isActive
                      ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50 glow'
                      : `${item.disabled ? 'text-gray-500 cursor-not-allowed' : 'text-gray-200 hover:text-white hover:bg-slate-800/80'}`
                  }`
                }
                onClick={(e) => {
                  if (item.disabled) {
                    e.preventDefault();
                    setShowCreateProject(true);
                  }
                }}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Info */}
        {currentUser && (
          <div className="p-4 border-t border-white/20">
            <div className="flex items-center space-x-3 p-3 bg-slate-800/80 rounded-lg border border-slate-700/80">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/50"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-gray-300 truncate">{currentUser.email}</p>
                {currentUser.role === 'admin' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/30 text-indigo-200 border border-indigo-500/50">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass rounded-2xl p-8 max-w-md w-full mx-4 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Create New Project</h3>
              <button
                onClick={() => setShowCreateProject(false)}
                className="text-gray-400 hover:text-white p-2 hover:bg-slate-800/80 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Project Name *</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter project name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Description</label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="Describe your project (optional)"
                />
              </div>

              {createError && (
                <p className="text-red-400 text-sm">{createError}</p>
              )}
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowCreateProject(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!projectName.trim() || creating}>
                  {creating ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
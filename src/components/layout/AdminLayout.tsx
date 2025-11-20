import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  Users, 
  FolderOpen, 
  CheckSquare, 
  Settings, 
  BarChart3, 
  TrendingUp,
  Shield,
  LogOut,
  Home,
  Activity
} from 'lucide-react';
import { Button } from '../ui/Button';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  activeTab = 'dashboard',
  onTabChange 
}) => {
  const { currentUser, logout } = useApp();

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You need admin privileges to access this area.</p>
        </div>
      </div>
    );
  }

  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, description: 'Overview & metrics' },
    { id: 'users', label: 'Users', icon: Users, description: 'User management' },
    { id: 'projects', label: 'Projects', icon: FolderOpen, description: 'Project control' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, description: 'Task management' },
    { id: 'system', label: 'System', icon: Settings, description: 'System settings' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, description: 'Advanced analytics' }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Admin Header */}
      <div className="bg-slate-800/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-indigo-400" />
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-sm text-gray-400">Project Bolt Administration</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{currentUser.name}</p>
                  <p className="text-xs text-gray-400">Administrator</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.location.href = '/'}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Main App
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Admin Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="glass rounded-2xl p-4 sticky top-8">
              <nav className="space-y-2">
                {adminTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange?.(tab.id)}
                      className={`w-full flex items-start space-x-3 p-3 rounded-xl text-left transition-all duration-200 ${
                        isActive
                          ? 'bg-indigo-500 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mt-0.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <p className={`font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                          {tab.label}
                        </p>
                        <p className={`text-xs ${isActive ? 'text-indigo-100' : 'text-gray-500'}`}>
                          {tab.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </nav>

              {/* Quick Stats */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Quick Stats</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Status</span>
                    <span className="text-green-400 font-medium">Online</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Version</span>
                    <span className="text-gray-300">v1.0.0</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Environment</span>
                    <span className="text-yellow-400 font-medium">Production</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

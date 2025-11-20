import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/Button';
import { Bell, Search, Settings, User, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { currentUser, logout, tasks, projects, users } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  if (!currentUser) return null;

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results = [];
    const lowerQuery = query.toLowerCase();

    // Search in tasks
    tasks.forEach(task => {
      if (task.title.toLowerCase().includes(lowerQuery) || 
          task.description.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'task',
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority
        });
      }
    });

    // Search in projects
    projects.forEach(project => {
      if (project.name.toLowerCase().includes(lowerQuery) || 
          project.description.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'project',
          id: project.id,
          title: project.name,
          description: project.description,
          key: project.key
        });
      }
    });

    // Search in users
    users.forEach(user => {
      if (user.name.toLowerCase().includes(lowerQuery) || 
          user.email.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'user',
          id: user.id,
          title: user.name,
          description: user.email,
          role: user.role
        });
      }
    });

    setSearchResults(results.slice(0, 8)); // Limit to 8 results
    setShowSearchResults(true);
  };

  // Handle result click
  const handleResultClick = (result: any) => {
    setSearchQuery('');
    setShowSearchResults(false);
    
    switch (result.type) {
      case 'task':
        navigate(`/tasks`);
        break;
      case 'project':
        navigate(`/dashboard`);
        break;
      case 'user':
        navigate(`/team`);
        break;
    }
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="glass border-b border-white/20 backdrop-blur-md">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 max-w-md relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="text"
                placeholder="Search tasks, projects, or people..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-600 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowSearchResults(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl z-50 max-h-96 overflow-y-auto">
                <div className="p-2">
                  {searchResults.map((result, index) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800/80 cursor-pointer transition-all duration-200"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        result.type === 'task' ? 'bg-blue-500/20 text-blue-400' :
                        result.type === 'project' ? 'bg-green-500/20 text-green-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {result.type === 'task' && <Search className="w-4 h-4" />}
                        {result.type === 'project' && <Search className="w-4 h-4" />}
                        {result.type === 'user' && <User className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{result.title}</p>
                        <p className="text-xs text-gray-400 truncate">{result.description}</p>
                        {result.type === 'task' && (
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              result.status === 'done' ? 'bg-green-500/20 text-green-400' :
                              result.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                              result.status === 'review' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {result.status}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              result.priority === 'high' || result.priority === 'highest' ? 'bg-red-500/20 text-red-400' :
                              result.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {result.priority}
                            </span>
                          </div>
                        )}
                        {result.type === 'project' && (
                          <span className="text-xs text-gray-400 mt-1">Project • {result.key}</span>
                        )}
                        {result.type === 'user' && (
                          <span className="text-xs text-gray-400 mt-1 capitalize">{result.role || 'user'}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results Message */}
            {showSearchResults && searchQuery && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl z-50 p-4">
                <p className="text-gray-400 text-center">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-200 hover:text-white hover:bg-slate-800/80 rounded-lg transition-all duration-200 hover-lift">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <button className="p-2 text-gray-200 hover:text-white hover:bg-slate-800/80 rounded-lg transition-all duration-200 hover-lift">
              <Settings className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-800/80 transition-all duration-200 cursor-pointer hover-lift">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/50"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white">{currentUser.name}</p>
                  <p className="text-xs text-gray-300">{currentUser.role || 'user'}</p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-200 hover:text-white hover:bg-slate-800/80"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
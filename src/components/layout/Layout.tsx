import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useApp } from '../../contexts/AppContext';
import { CreateProjectModal } from '../project/CreateProjectModal';

export const Layout: React.FC = () => {
  const { currentUser, projects, loading } = useApp() as any;
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [hasCheckedProjects, setHasCheckedProjects] = useState(false);

  // Mark that we've completed at least one data load cycle
  useEffect(() => {
    if (!loading) {
      setHasCheckedProjects(true);
    }
  }, [loading]);

  useEffect(() => {
    if (currentUser && hasCheckedProjects && projects.length === 0) {
      setShowCreateProject(true);
    } else if (projects.length > 0) {
      setShowCreateProject(false);
    }
  }, [currentUser, hasCheckedProjects, projects.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <CreateProjectModal isOpen={showCreateProject} onClose={() => setShowCreateProject(false)} />
    </div>
  );
};
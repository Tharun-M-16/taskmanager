import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Project, Task, Comment } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { apiService } from '../services/api';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  visitCount: number;
  projects: Project[];
  adminProjects?: Project[];
  currentProject: Project | null;
  tasks: Task[];
  allTasks: Task[];
  adminTasks?: Task[];
  loading: boolean;
  setCurrentProject: (project: Project | null) => void;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ ok: boolean; message?: string }>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'projectId'> & { project: string }) => Promise<{ ok: boolean; message?: string }>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<{ ok: boolean; message?: string }>;
  deleteTask: (taskId: string) => Promise<{ ok: boolean; message?: string }>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<{ ok: boolean; message?: string }>;
  deleteProject: (projectId: string) => Promise<{ ok: boolean; message?: string }>;
  addComment: (taskId: string, content: string) => Promise<{ ok: boolean; message?: string }>;
  addTeamMember: (member: Omit<User, 'id'>) => Promise<{ ok: boolean; message?: string }>;
  removeTeamMember: (memberId: string) => Promise<{ ok: boolean; message?: string }>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<{ ok: boolean; message?: string }>;
  deleteUser: (userId: string) => Promise<{ ok: boolean; message?: string }>;
  login: (user: User) => void;
  loginWithEmail: (email: string) => boolean;
  loginWithCredentials: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  signup: (user: { name: string; email: string; password: string; avatar?: string }) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [users, setUsers] = useLocalStorage<User[]>('users', []);
  const [visitCount, setVisitCount] = useLocalStorage<number>('visitCount', 0);
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', []);
  const [adminProjects, setAdminProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useLocalStorage<Project | null>('currentProject', null);
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [adminTasks, setAdminTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize API token from localStorage
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      apiService.setToken(token);
    }
  }, []);

  // Verify token and load user data on mount
  useEffect(() => {
    const initializeApp = async () => {
      const token = localStorage.getItem('authToken');
      if (token && !currentUser) {
        try {
          const response = await apiService.verifyToken();
          if (response.success) {
            const user = response.data.user;
            setCurrentUser({
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role || 'user',
              avatar: user.avatar
            });
            await refreshData();
          } else {
            // Token is invalid, clear it
            apiService.removeToken();
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          apiService.removeToken();
          setCurrentUser(null);
        }
      }
    };

    initializeApp();
  }, []);

  // Count a visit each time the app provider mounts
  useEffect(() => {
    setVisitCount(c => (typeof c === 'number' ? c : 0) + 1);
  }, []);

  const refreshData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      // Load projects
      const projectsResponse = await apiService.getProjects();
      if (projectsResponse.success) {
        const projectsData = projectsResponse.data.projects.map((p: any) => ({
          id: p._id,
          name: p.name,
          key: p.key,
          description: p.description,
          owner: p.owner,
          members: (p.members || []).map((m: any) => ({
            id: m.user?._id || m.user, // support unpopulated
            name: m.user?.name || '',
            email: m.user?.email || '',
            avatar: m.user?.avatar || null,
            role: m.role,
            joinedAt: m.joinedAt
          })),
          status: p.status,
          visibility: p.visibility,
          tags: p.tags,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        }));
        setProjects(projectsData);
        // Keep currentProject in sync with refreshed data
        if (currentProject) {
          const updated = projectsData.find((proj: any) => proj.id === currentProject.id);
          if (updated) setCurrentProject(updated);
        } else if (projectsData.length > 0) {
          // Auto-select first project if none selected
          setCurrentProject(projectsData[0]);
        }
      }

      // Load tasks
      const tasksResponse = await apiService.getTasks();
      if (tasksResponse.success) {
        const mapped = tasksResponse.data.tasks.map((t: any) => ({
          id: t._id,
          title: t.title,
          description: t.description || '',
          status: t.status,
          priority: t.priority,
          type: t.type,
          projectId: t.project._id,
          project: t.project,
          assigneeId: t.assignee?._id,
          assignee: t.assignee,
          reporterId: t.reporter._id,
          reporter: t.reporter,
          dueDate: t.dueDate ? new Date(t.dueDate) : null,
          estimatedHours: t.estimatedHours,
          actualHours: t.actualHours,
          labels: t.labels,
          comments: t.comments || [],
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt)
        }));
        // Dedupe by id to avoid repeated cards
        const uniqueById = Array.from(new Map(mapped.map((task: any) => [task.id, task])).values());
        setTasks(uniqueById);
      }

      // Load admin datasets
      if (currentUser.role === 'admin') {
        // Users
        const usersResponse = await apiService.getAdminUsers();
        if (usersResponse.success) {
          const usersData = usersResponse.data.users.map((u: any) => ({
            id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            avatar: u.avatar,
            isActive: u.isActive,
            createdAt: new Date(u.createdAt),
            updatedAt: new Date(u.updatedAt)
          }));
          setUsers(usersData);
        }

        // Projects (admin-wide)
        const adminProjectsResponse = await apiService.getAdminProjects();
        if (adminProjectsResponse.success) {
          const adminProjectsData = adminProjectsResponse.data.projects.map((p: any) => ({
            id: p._id,
            name: p.name,
            key: p.key,
            description: p.description,
            owner: p.owner,
            members: (p.members || []).map((m: any) => ({
              id: m.user?._id || m.user,
              name: m.user?.name || '',
              email: m.user?.email || '',
              avatar: m.user?.avatar || null,
              role: m.role,
              joinedAt: m.joinedAt
            })),
            status: p.status,
            visibility: p.visibility,
            tags: p.tags,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt)
          }));
          setAdminProjects(adminProjectsData);
        }

        // Tasks (admin-wide)
        const adminTasksResponse = await apiService.getAdminTasks();
        if (adminTasksResponse.success) {
          const adminTasksData = adminTasksResponse.data.tasks.map((t: any) => ({
            id: t._id,
            title: t.title,
            description: t.description || '',
            status: t.status,
            priority: t.priority,
            type: t.type,
            projectId: t.project?._id || t.project,
            project: t.project,
            assigneeId: t.assignee?._id,
            assignee: t.assignee,
            reporterId: t.reporter?._id,
            reporter: t.reporter,
            dueDate: t.dueDate ? new Date(t.dueDate) : null,
            estimatedHours: t.estimatedHours,
            actualHours: t.actualHours,
            labels: t.labels,
            comments: t.comments || [],
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt)
          }));
          setAdminTasks(adminTasksData);
        }
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await apiService.createProject(projectData);
      if (response.success) {
        const newProject = {
          ...response.data.project,
          id: response.data.project._id,
          createdAt: new Date(response.data.project.createdAt),
          updatedAt: new Date(response.data.project.updatedAt)
        };
        // Immediately refresh from server to ensure full, up-to-date project list
        await refreshData();
        // After refresh, set current project using its id from the refreshed list
        // Try to find created project in the refreshed list; fall back to returned project
        const refreshedProjects = await apiService.getProjects();
        let updated: any = newProject;
        try {
          if (refreshedProjects && refreshedProjects.success) {
            const list = refreshedProjects.data.projects.map((p: any) => ({
              id: p._id,
              name: p.name,
              key: p.key,
              description: p.description,
              owner: p.owner,
              members: (p.members || []).map((m: any) => ({ id: m.user?._id || m.user, name: m.user?.name || '', email: m.user?.email || '', avatar: m.user?.avatar || null, role: m.role, joinedAt: m.joinedAt })),
              status: p.status,
              visibility: p.visibility,
              tags: p.tags,
              createdAt: new Date(p.createdAt),
              updatedAt: new Date(p.updatedAt)
            }));
            updated = list.find((p: any) => p.id === newProject.id) || newProject;
          }
        } catch (e) {
          updated = newProject;
        }
        setCurrentProject(updated);
        return { ok: true };
      } else {
        return { ok: false, message: response.message };
      }
    } catch (error: any) {
      return { ok: false, message: error.message };
    }
  };

  // Accept payloads with either `project` or `projectId` and normalize for backend
  const createTask = async (taskData: any) => {
    try {
      const payload = { ...taskData };
      if (!payload.project && payload.projectId) payload.project = payload.projectId;
      // backend expects 'assignee' field name
      if (payload.assigneeId && !payload.assignee) payload.assignee = payload.assigneeId;

      const response = await apiService.createTask(payload);
      if (response.success) {
        await refreshData(); // avoid duplicates by reloading from server
        return { ok: true };
      } else {
        return { ok: false, message: response.message };
      }
    } catch (error: any) {
      return { ok: false, message: error.message };
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = currentUser && currentUser.role === 'admin'
        ? await apiService.updateAdminTask(taskId, updates)
        : await apiService.updateTask(taskId, updates);
      if (response.success) {
        const updatedTask = {
          ...response.data.task,
          id: response.data.task._id,
          projectId: response.data.task.project._id,
          assigneeId: response.data.task.assignee?._id,
          reporterId: response.data.task.reporter._id,
          createdAt: new Date(response.data.task.createdAt),
          updatedAt: new Date(response.data.task.updatedAt)
        };
        setTasks(prev => prev.map(task => 
          task.id === taskId ? updatedTask : task
        ));
        return { ok: true };
      } else {
        return { ok: false, message: response.message };
      }
    } catch (error: any) {
      return { ok: false, message: error.message };
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = currentUser && currentUser.role === 'admin'
        ? await apiService.deleteAdminTask(taskId)
        : await apiService.deleteTask(taskId);
      if (response.success) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        return { ok: true };
      } else {
        return { ok: false, message: response.message };
      }
    } catch (error: any) {
      return { ok: false, message: error.message };
    }
  };

  const addComment = async (taskId: string, content: string) => {
    try {
      const response = await apiService.request(`/tasks/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      if (response.success) {
        await refreshData(); // Refresh to get updated task with new comment
        return { ok: true };
      } else {
        return { ok: false, message: response.message };
      }
    } catch (error: any) {
      return { ok: false, message: error.message };
    }
  };

  const addTeamMember = async (memberData: Omit<User, 'id'>) => {
    if (!currentProject) return { ok: false, message: 'No project selected' };
    
    try {
      const body: any = { role: 'member' };
      // If we have an id (existing user), use it; otherwise send email/name for backend to resolve or create
      if ((memberData as any).id) {
        body.userId = (memberData as any).id;
      } else {
        body.email = memberData.email;
        body.name = memberData.name;
      }

      const response = await apiService.request(`/projects/${currentProject.id}/members`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (response.success) {
        await refreshData();
        return { ok: true };
      } else {
        return { ok: false, message: response.message };
      }
    } catch (error: any) {
      return { ok: false, message: error.message };
    }
  };

  const removeTeamMember = async (memberId: string) => {
    if (!currentProject) return { ok: false, message: 'No project selected' };
    
    try {
      const response = await apiService.request(`/projects/${currentProject.id}/members/${memberId}`, {
        method: 'DELETE',
      });
      if (response.success) {
        await refreshData();
        return { ok: true };
      } else {
        return { ok: false, message: response.message };
      }
    } catch (error: any) {
      return { ok: false, message: error.message };
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      let response: any;
      if (currentUser && userId === currentUser.id) {
        // Regular user updating own profile
        response = await apiService.updateProfile({
          name: updates.name,
          email: updates.email,
          avatar: updates.avatar
        });
      } else {
        // Admin updating another user
        response = await apiService.updateAdminUser(userId, updates);
      }
      if (response.success) {
        await refreshData();
        return { ok: true };
      } else {
        return { ok: false, message: response.message };
      }
    } catch (error: any) {
      return { ok: false, message: error.message };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const response = await apiService.deleteAdminUser(userId);
      if (response.success) {
        await refreshData();
        return { ok: true };
      } else {
        return { ok: false, message: response.message };
      }
    } catch (error: any) {
      return { ok: false, message: error.message };
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const response = await apiService.updateProject(projectId, updates);
      if (response.success) {
        // Refresh local lists so UI sees latest data
        await refreshData();
        return { ok: true };
      }
      return { ok: false, message: response.message };
    } catch (error: any) {
      return { ok: false, message: error.message };
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const response = currentUser && currentUser.role === 'admin'
        ? await apiService.deleteAdminProject(projectId)
        : await apiService.deleteProject(projectId);
      if (response.success) {
        // Remove from local lists
        setProjects(prev => prev.filter(p => p.id !== projectId));
        setAdminProjects(prev => prev.filter(p => p.id !== projectId));
        if (currentProject && currentProject.id === projectId) setCurrentProject(null);
        return { ok: true };
      }
      return { ok: false, message: response.message };
    } catch (error: any) {
      return { ok: false, message: error.message };
    }
  };

  const login = (user: User) => {
    setCurrentUser(user);
  };

  const loginWithEmail = (email: string) => {
    console.warn('loginWithEmail is deprecated. Use loginWithCredentials instead.');
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!existing) return false;
    setCurrentUser(existing);
    return true;
  };

  const loginWithCredentials = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password });
      if (response.success) {
        const user = response.data.user;
        const newUser: User = {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          avatar: user.avatar
        };
        
        setCurrentUser(newUser);
        apiService.setToken(response.data.token);
        await refreshData();
        return { ok: true };
      } else {
        return { ok: false, message: response.message };
      }
    } catch (error: any) {
      return { ok: false, message: error.message || 'Login failed' };
    }
  };

  const signup = async (userData: { name: string; email: string; password: string }) => {
    try {
      if (!userData.password || userData.password.length < 6) {
        return { ok: false, message: 'Password must be at least 6 characters.' };
      }
      
      const response = await apiService.register(userData);
      
      if (response.success) {
        const newUser: User = { 
          id: response.data.user._id, 
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role || 'user',
          avatar: response.data.user.avatar
        };
        
        setCurrentUser(newUser);
        apiService.setToken(response.data.token);
        await refreshData();
        
        return { ok: true };
      } else {
        return { ok: false, message: response.message || 'Registration failed.' };
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      return { ok: false, message: error.message || 'Registration failed.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentProject(null);
    setProjects([]);
    setTasks([]);
    setUsers([]);
    apiService.removeToken();
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      visitCount,
      projects,
      currentProject,
      tasks: currentProject ? tasks.filter(task => task.projectId === currentProject.id) : [],
      allTasks: tasks,
      adminProjects,
      adminTasks,
      loading,
      setCurrentProject,
      createProject,
      createTask,
      updateTask,
      deleteTask,
      updateProject,
      deleteProject,
      addComment,
      addTeamMember,
      removeTeamMember,
      updateUser,
      deleteUser,
      login,
      loginWithEmail,
      loginWithCredentials,
      signup,
      logout,
      refreshData
    }}>
      {children}
    </AppContext.Provider>
  );
};
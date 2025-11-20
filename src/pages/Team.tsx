import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { User, Mail, Clock, CheckCircle, Trash2, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AddMemberModal } from '../components/team/AddMemberModal';

export const Team: React.FC = () => {
  const { currentProject, tasks, removeTeamMember } = useApp();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const getMemberStats = (memberId: string) => {
    const memberTasks = tasks.filter(task => task.assigneeId === memberId);
    return {
      total: memberTasks.length,
      completed: memberTasks.filter(task => task.status === 'done').length,
      inProgress: memberTasks.filter(task => task.status === 'in-progress').length,
      pending: memberTasks.filter(task => task.status === 'todo').length
    };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Team</h1>
        <p className="text-gray-200 text-lg">
          {currentProject ? `Team members for ${currentProject.name}` : 'No project selected'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-center">
        <Button onClick={() => setIsAddOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Team Members */}
      {currentProject?.members ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentProject.members.map(member => {
            const stats = getMemberStats(member.id);
            const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

            return (
              <div key={member.id} className="glass rounded-2xl p-6 border border-white/10">
                {/* Member Info */}
                <div className="flex items-center space-x-4 mb-4">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/30"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                    <div className="flex items-center space-x-1 text-sm text-gray-300">
                      <Mail className="w-3 h-3" />
                      <span>{member.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeTeamMember(member.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Total Tasks</span>
                    <span className="font-medium text-white">{stats.total}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Completed</span>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="font-medium text-white">{stats.completed}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">In Progress</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span className="font-medium text-white">{stats.inProgress}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-medium text-gray-500">{stats.pending}</span>
                  </div>

                  {/* Completion Rate */}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Completion Rate</span>
                      <span className="font-medium">{completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Members</h3>
          <p className="text-gray-600">Select a project to view team members</p>
        </div>
      )}

      <AddMemberModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
};
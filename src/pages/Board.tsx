import React, { useState } from 'react';
import { KanbanBoard } from '../components/board/KanbanBoard';
import { CreateTaskModal } from '../components/task/CreateTaskModal';
import { Button } from '../components/ui/Button';
import { Plus, Filter, Search } from 'lucide-react';

export const Board: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Kanban Board</h1>
        <p className="text-gray-200 text-lg">Drag and drop tasks to update their status</p>
      </div>
      
      {/* Actions */}
      <div className="flex justify-center">
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Kanban Board */}
      <KanbanBoard />

      {/* Create Task Modal */}
      <CreateTaskModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
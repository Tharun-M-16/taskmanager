import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { BoardColumn } from '../../types';
import { SortableTaskCard } from './SortableTaskCard';
import { TaskDetailModal } from '../task/TaskDetailModal';
import { Task } from '../../types';
import { Plus } from 'lucide-react';
import clsx from 'clsx';

interface KanbanColumnProps {
  column: BoardColumn;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const columnColors = {
    'todo': 'border-gray-300 bg-gray-50',
    'in-progress': 'border-blue-300 bg-blue-50',
    'review': 'border-yellow-300 bg-yellow-50',
    'done': 'border-green-300 bg-green-50'
  };

  return (
    <>
      <div className="flex flex-col w-80 flex-shrink-0">
        {/* Column header */}
        <div className={clsx(
          'p-4 border-2 border-dashed rounded-t-lg',
          columnColors[column.id]
        )}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {column.title} ({column.tasks.length})
            </h3>
            <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Column content */}
        <div
          ref={setNodeRef}
          className={clsx(
            'flex-1 p-4 border-2 border-dashed border-t-0 rounded-b-lg min-h-96',
            columnColors[column.id]
          )}
        >
          <SortableContext
            items={column.tasks.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {column.tasks.map(task => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  onClick={() => setSelectedTask(task)}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      </div>

      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </>
  );
};
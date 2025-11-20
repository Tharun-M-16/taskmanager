import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useApp } from '../../contexts/AppContext';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
  const { createProject, currentUser } = useApp();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setError('');
    setCreating(true);
    try {
      const baseKey = (key || name.replace(/[^A-Za-z0-9]/g, '').slice(0, 4)).toUpperCase() || 'PRJ';
      let attempt = 0;
      let ok = false;
      let lastMessage = '';
      while (attempt < 3 && !ok) {
        const nextKey = attempt === 0 ? baseKey : `${baseKey}${attempt + 1}`;
        const result = await createProject({
          name,
          key: nextKey,
          description,
          ownerId: currentUser.id,
          members: [currentUser],
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
        setError(lastMessage || 'Failed to create project');
        return;
      }
      setName('');
      setKey('');
      setDescription('');
      onClose();
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Project" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Project name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. TFD"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What is this project about?"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}
        <div className="flex justify-end space-x-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!name.trim() || creating}>{creating ? 'Creating...' : 'Create Project'}</Button>
        </div>
      </form>
    </Modal>
  );
};



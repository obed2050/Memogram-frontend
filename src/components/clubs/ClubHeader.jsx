import { useState } from 'react';
import { HiCamera, HiUserGroup } from 'react-icons/hi2';
import { clubService } from '../../services';
import toast from 'react-hot-toast';

const ClubHeader = ({ club, onUpdated }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(club.name);
  const [description, setDescription] = useState(club.description || '');

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      await clubService.updateClub(club.id, formData);
      onUpdated?.();
      setEditing(false);
      toast.success('Club updated');
    } catch {
      toast.error('Failed to update club');
    }
  };

  return (
    <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-green-500/20 to-blue-500/20 relative">
        {club.coverImage && (
          <img src={club.coverImage} alt="" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="p-4">
        <div className="flex items-end gap-3 -mt-8 mb-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center border-4 border-dark-card shrink-0 overflow-hidden">
            {club.logo ? (
              <img src={club.logo} alt="" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <span className="text-2xl font-bold text-white">{club.name?.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-dark-surface border border-dark-border rounded-lg px-3 py-1.5 text-lg font-bold text-white w-full focus:outline-none focus:border-primary/50"
              />
            ) : (
              <h1 className="text-lg font-bold text-white">{club.name}</h1>
            )}
            <p className="text-xs text-gray-500">{club.school?.name}</p>
          </div>
        </div>

        {editing ? (
          <div className="space-y-2 mb-3">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Club description"
              rows={2}
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 resize-none"
            />
            <div className="flex gap-2">
              <button onClick={handleSave} className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/80 transition-colors">Save</button>
              <button onClick={() => setEditing(false)} className="px-3 py-1 text-gray-400 hover:text-white text-xs transition-colors">Cancel</button>
            </div>
          </div>
        ) : club.description ? (
          <p className="text-sm text-gray-300 mb-3">{club.description}</p>
        ) : null}

        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <HiUserGroup className="w-3.5 h-3.5" />
            {club.memberCount} members
          </span>
          <span>{club.postsCount || 0} posts</span>
        </div>
      </div>
    </div>
  );
};

export default ClubHeader;

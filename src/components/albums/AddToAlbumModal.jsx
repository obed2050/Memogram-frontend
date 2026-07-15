import { useState, useEffect } from 'react';
import { HiPlus, HiCheck, HiPhoto } from 'react-icons/hi2';
import { albumService } from '../services';
import Avatar from '../ui/Avatar';
import toast from 'react-hot-toast';

const AddToAlbumModal = ({ isOpen, onClose, postId }) => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        const res = await albumService.getMyAlbums({ limit: 50 });
        setAlbums(res.data.data || []);
      } catch {
        toast.error('Failed to load albums');
      } finally {
        setLoading(false);
      }
    };
    fetchAlbums();
  }, [isOpen]);

  const handleAdd = async (albumId) => {
    try {
      setAdding(albumId);
      await albumService.addItem(albumId, { postId });
      toast.success('Added to album');
      onClose?.(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    } finally {
      setAdding(null);
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newName.trim()) return;
    try {
      setAdding('new');
      const formData = new FormData();
      formData.append('name', newName);
      formData.append('visibility', 'public');
      const res = await albumService.create(formData);
      await albumService.addItem(res.data.album.id, { postId });
      toast.success(`Created "${newName}" and added post`);
      onClose?.(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setAdding(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => onClose?.()}>
      <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-sm p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-bold text-white">Add to Album</h3>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-1">
            {albums.map((album) => (
              <button
                key={album.id}
                onClick={() => handleAdd(album.id)}
                disabled={adding !== null}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-dark-surface transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-dark-surface overflow-hidden shrink-0">
                  {album.coverImage ? (
                    <img src={album.coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <HiPhoto className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{album.name}</p>
                  <p className="text-xs text-gray-500">{album.postsCount || 0} items</p>
                </div>
                {adding === album.id ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <HiPlus className="w-4 h-4 text-gray-500" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Quick Create */}
        {showCreate ? (
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Album name"
              className="flex-1 bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
              autoFocus
            />
            <button
              onClick={handleCreateAndAdd}
              disabled={!newName.trim() || adding !== null}
              className="px-3 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/80 disabled:opacity-50 transition-colors"
            >
              {adding === 'new' ? '...' : 'Create'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-dark-border text-sm text-gray-400 hover:text-white hover:border-primary/30 transition-colors"
          >
            <HiPlus className="w-4 h-4" />
            Create new album
          </button>
        )}

        <button
          onClick={() => onClose?.()}
          className="w-full py-2 text-xs text-gray-500 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddToAlbumModal;

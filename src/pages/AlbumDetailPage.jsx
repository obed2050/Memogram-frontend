import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  HiArrowLeft, HiPencil, HiTrash, HiPlus, HiPhoto, HiGlobeAlt,
  HiUserGroup, HiLockClosed, HiEllipsisHorizontal, HiChevronDown,
} from 'react-icons/hi2';
import { albumService, postService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/feed/PostCard';
import { PostSkeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title', label: 'By title' },
  { value: 'custom', label: 'Custom order' },
];

const VIS_ICONS = { public: HiGlobeAlt, friends: HiUserGroup, private: HiLockClosed };

const AlbumDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editVis, setEditVis] = useState('public');
  const [editSort, setEditSort] = useState('newest');
  const [saving, setSaving] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const fetchAlbum = useCallback(async () => {
    try {
      const res = await albumService.getOne(id);
      setAlbum(res.data.album);
    } catch {
      toast.error('Failed to load album');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAlbum();
  }, [fetchAlbum]);

  const isOwner = album?.userId === user?.id;

  const handleUpdate = async () => {
    if (!editName.trim()) return;
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('description', editDesc);
      formData.append('visibility', editVis);
      formData.append('sortBy', editSort);

      const res = await albumService.update(id, formData);
      setAlbum((prev) => ({ ...prev, ...res.data.album }));
      setShowEdit(false);
      toast.success('Album updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this album? All items will be removed.')) return;
    try {
      await albumService.delete(id);
      toast.success('Album deleted');
      window.history.back();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    try {
      setSearching(true);
      const res = await postService.getFeed({ q, limit: 10 });
      setSearchResults(res.data.data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddItem = async (postId) => {
    try {
      await albumService.addItem(id, { postId });
      toast.success('Added to album');
      setShowAdd(false);
      setSearchQuery('');
      setSearchResults([]);
      fetchAlbum();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    }
  };

  const handleRemoveItem = async (postId) => {
    if (!confirm('Remove this post from the album?')) return;
    try {
      await albumService.removeItem(id, postId);
      setAlbum((prev) => ({
        ...prev,
        items: prev.items.filter((i) => i.postId !== postId),
        postsCount: Math.max(0, (prev.postsCount || 0) - 1),
      }));
      toast.success('Removed from album');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handleSortChange = async (sortBy) => {
    try {
      await albumService.update(id, { sortBy });
      setAlbum((prev) => ({ ...prev, sortBy }));
      fetchAlbum();
    } catch {
      toast.error('Failed to sort');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-12 rounded-xl" />
        <PostSkeleton />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Album not found</p>
        <Link to="/albums" className="text-primary-light text-sm mt-2 inline-block">Back to albums</Link>
      </div>
    );
  }

  const VisIcon = VIS_ICONS[album.visibility] || HiGlobeAlt;

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <Link to="/albums" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
        <HiArrowLeft className="w-4 h-4" />
        Albums
      </Link>

      {/* Header */}
      <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
        {/* Cover */}
        <div className="relative h-48 bg-dark-surface overflow-hidden">
          {album.coverImage ? (
            <img src={album.coverImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <HiPhoto className="w-16 h-16 text-gray-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white">{album.name}</h1>
              {album.description && (
                <p className="text-sm text-gray-400 mt-1">{album.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <VisIcon className="w-3.5 h-3.5" />
                  {album.visibility}
                </span>
                <span className="flex items-center gap-1">
                  <HiPhoto className="w-3.5 h-3.5" />
                  {album.postsCount || 0} items
                </span>
                <span>by {album.author?.fullName}</span>
              </div>
            </div>

            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 rounded-lg hover:bg-dark-surface text-gray-400 hover:text-white transition-colors"
                >
                  <HiEllipsisHorizontal className="w-5 h-5" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-dark-card border border-dark-border rounded-xl shadow-xl overflow-hidden z-20">
                    <button
                      onClick={() => {
                        setEditName(album.name);
                        setEditDesc(album.description || '');
                        setEditVis(album.visibility);
                        setEditSort(album.sortBy);
                        setShowEdit(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-surface transition-colors"
                    >
                      <HiPencil className="w-4 h-4" />
                      Edit Album
                    </button>
                    <button
                      onClick={() => { handleDelete(); setShowMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-dark-surface transition-colors"
                    >
                      <HiTrash className="w-4 h-4" />
                      Delete Album
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <select
            value={album.sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="appearance-none bg-dark-card border border-dark-border rounded-xl px-3 py-2 pr-8 text-xs text-gray-300 focus:outline-none focus:border-primary/50 cursor-pointer"
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <HiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
        </div>

        {isOwner && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary/20 text-primary-light rounded-xl text-xs font-medium hover:bg-primary/30 transition-colors"
          >
            <HiPlus className="w-3.5 h-3.5" />
            Add Post
          </button>
        )}
      </div>

      {/* Items */}
      {album.items && album.items.length > 0 ? (
        <div className="space-y-4">
          {album.items.map((item) => (
            <div key={item.id} className="relative">
              <PostCard post={item.post} />
              {isOwner && (
                <button
                  onClick={() => handleRemoveItem(item.postId)}
                  className="absolute top-3 right-3 p-1.5 bg-black/60 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-400 transition-colors z-10"
                  title="Remove from album"
                >
                  <HiTrash className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <HiPhoto className="w-10 h-10 text-gray-700 mx-auto mb-2" />
          <p className="text-gray-400 font-medium">Album is empty</p>
          {isOwner && (
            <button
              onClick={() => setShowAdd(true)}
              className="mt-2 text-primary-light text-sm hover:underline"
            >
              Add your first post
            </button>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowEdit(false)}>
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white">Edit Album</h3>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Album name"
              className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
            />
            <input
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
            />
            <div className="grid grid-cols-3 gap-2">
              {['public', 'friends', 'private'].map((v) => (
                <button
                  key={v}
                  onClick={() => setEditVis(v)}
                  className={`py-2 rounded-xl text-xs font-medium transition-all border ${
                    editVis === v ? 'border-primary bg-primary/10 text-white' : 'border-dark-border bg-dark-surface text-gray-400'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowEdit(false)} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving || !editName.trim()}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/80 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Post Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white">Add Post to Album</h3>
            <div className="relative">
              <input
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search your posts..."
                className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                autoFocus
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {searchResults.length > 0 ? (
                searchResults.map((post) => {
                  const alreadyAdded = album.items?.some((i) => i.postId === post.id);
                  return (
                    <button
                      key={post.id}
                      onClick={() => !alreadyAdded && handleAddItem(post.id)}
                      disabled={alreadyAdded}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors ${
                        alreadyAdded
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-dark-surface'
                      }`}
                    >
                      {post.images?.[0] && (
                        <img src={post.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white truncate">{post.content || 'No text'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                          {alreadyAdded && ' · Already in album'}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : searchQuery ? (
                <p className="text-center text-gray-500 text-sm py-4">No posts found</p>
              ) : (
                <p className="text-center text-gray-500 text-sm py-4">Type to search your posts</p>
              )}
            </div>
            <button
              onClick={() => { setShowAdd(false); setSearchQuery(''); setSearchResults([]); }}
              className="w-full py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlbumDetailPage;

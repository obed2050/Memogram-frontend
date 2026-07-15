import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  HiPlus, HiPhoto, HiGlobeAlt, HiUserGroup, HiLockClosed,
} from 'react-icons/hi2';
import { albumService } from '../services';
import AlbumCard from '../components/albums/AlbumCard';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { PostSkeleton } from '../components/ui/Skeleton';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import toast from 'react-hot-toast';

const AlbumsPage = () => {
  const [tab, setTab] = useState('my');
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const fetchAlbums = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const fn = tab === 'my' ? albumService.getMyAlbums : albumService.getFeed;
      const res = await fn({ page: pageNum, limit: 20 });
      if (pageNum === 1) {
        setAlbums(res.data.data);
      } else {
        setAlbums((prev) => [...prev, ...res.data.data]);
      }
      setHasMore(res.data.pagination.hasNext);
    } catch {
      toast.error('Failed to load albums');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    setPage(1);
    setAlbums([]);
    fetchAlbums(1);
  }, [tab, fetchAlbums]);

  const fetchMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAlbums(nextPage);
  }, [page, fetchAlbums]);

  const lastRef = useInfiniteScroll(fetchMore, hasMore, loading);

  const resetCreate = () => {
    setName('');
    setDescription('');
    setVisibility('public');
    setCoverFile(null);
    setCoverPreview(null);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Album name is required');
      return;
    }
    try {
      setCreating(true);
      const formData = new FormData();
      formData.append('name', name);
      if (description) formData.append('description', description);
      formData.append('visibility', visibility);
      if (coverFile) formData.append('coverImage', coverFile);

      const res = await albumService.create(formData);
      setAlbums((prev) => [res.data.album, ...prev]);
      setShowCreate(false);
      resetCreate();
      toast.success('Album created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create album');
    } finally {
      setCreating(false);
    }
  };

  const VIS_OPTIONS = [
    { value: 'public', label: 'Public', icon: HiGlobeAlt, desc: 'Anyone can see' },
    { value: 'friends', label: 'Friends', icon: HiUserGroup, desc: 'Only friends' },
    { value: 'private', label: 'Private', icon: HiLockClosed, desc: 'Only you' },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <HiPhoto className="w-6 h-6 text-accent" />
            Albums
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Organize your memories</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-accent rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
        >
          <HiPlus className="w-4 h-4" />
          New Album
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-card rounded-xl p-1 border border-dark-border">
        <button
          onClick={() => setTab('my')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'my' ? 'bg-dark-surface text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          My Albums
        </button>
        <button
          onClick={() => setTab('feed')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'feed' ? 'bg-dark-surface text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Discover
        </button>
      </div>

      {/* Grid */}
      {loading && albums.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <div className="skeleton aspect-square rounded-2xl" />
              <div className="skeleton h-4 w-2/3 rounded-lg" />
            </div>
          ))}
        </div>
      ) : albums.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {albums.map((album, index) => (
            <div key={album.id} ref={index === albums.length - 1 ? lastRef : null}>
              <AlbumCard album={album} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <HiPhoto className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">
            {tab === 'my' ? 'No albums yet' : 'No public albums to discover'}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            {tab === 'my' ? 'Create your first album to organize memories' : 'Check back later'}
          </p>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); resetCreate(); }} title="New Album" size="md">
        <div className="p-6 space-y-5">
          {/* Cover Preview */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block">Cover Image (optional)</label>
            {coverPreview ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-dark-border">
                <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setCoverFile(null); setCoverPreview(null); }}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white text-xs hover:bg-black/80"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center aspect-video rounded-2xl border-2 border-dashed border-dark-border hover:border-primary/30 bg-dark-surface cursor-pointer transition-all">
                <div className="text-center">
                  <HiPlus className="w-6 h-6 text-gray-500 mx-auto mb-1" />
                  <span className="text-xs text-gray-500">Add cover</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); }
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Album Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Graduation 2024"
              maxLength={100}
              className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Description (optional)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this album about?"
              maxLength={500}
              className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block">Visibility</label>
            <div className="grid grid-cols-3 gap-2">
              {VIS_OPTIONS.map(({ value, label, icon: Icon, desc }) => (
                <button
                  key={value}
                  onClick={() => setVisibility(value)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    visibility === value
                      ? 'border-primary bg-primary/10 text-white'
                      : 'border-dark-border bg-dark-surface text-gray-400 hover:border-dark-hover'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <p className="text-xs font-medium">{label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleCreate}
            loading={creating}
            disabled={!name.trim()}
            className="w-full bg-gradient-to-r from-primary to-accent"
          >
            Create Album
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AlbumsPage;

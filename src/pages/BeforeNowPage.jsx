import { useState, useEffect, useCallback, useRef } from 'react';
import { HiPlus, HiSparkles, HiArrowTrendingUp } from 'react-icons/hi2';
import { beforeNowService } from '../services';
import BeforeNowCard from '../components/before-now/BeforeNowCard';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { PostSkeleton } from '../components/ui/Skeleton';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import toast from 'react-hot-toast';

const BeforeNowPage = () => {
  const [tab, setTab] = useState('feed');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [beforeCaption, setBeforeCaption] = useState('');
  const [afterCaption, setAfterCaption] = useState('');
  const [beforeYear, setBeforeYear] = useState('');
  const [afterYear, setAfterYear] = useState('');
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [beforePreview, setBeforePreview] = useState(null);
  const [afterPreview, setAfterPreview] = useState(null);
  const beforeRef = useRef(null);
  const afterRef = useRef(null);

  const fetchItems = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const fn = tab === 'feed' ? beforeNowService.getFeed : beforeNowService.getExplore;
      const res = await fn({ page: pageNum, limit: 20 });
      if (pageNum === 1) {
        setItems(res.data.data);
      } else {
        setItems((prev) => [...prev, ...res.data.data]);
      }
      setHasMore(res.data.pagination.hasNext);
    } catch {
      toast.error('Failed to load comparisons');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    setPage(1);
    setItems([]);
    fetchItems(1);
  }, [tab, fetchItems]);

  const fetchMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchItems(nextPage);
  }, [page, fetchItems]);

  const lastRef = useInfiniteScroll(fetchMore, hasMore, loading);

  const handleBeforeFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBeforeFile(file);
    setBeforePreview(URL.createObjectURL(file));
  };

  const handleAfterFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAfterFile(file);
    setAfterPreview(URL.createObjectURL(file));
  };

  const resetCreate = () => {
    setTitle('');
    setBeforeCaption('');
    setAfterCaption('');
    setBeforeYear('');
    setAfterYear('');
    setBeforeFile(null);
    setAfterFile(null);
    setBeforePreview(null);
    setAfterPreview(null);
  };

  const handleCreate = async () => {
    if (!beforeFile || !afterFile) {
      toast.error('Both photos are required');
      return;
    }
    try {
      setCreating(true);
      const formData = new FormData();
      formData.append('media', beforeFile);
      formData.append('media', afterFile);
      if (title) formData.append('title', title);
      if (beforeCaption) formData.append('beforeCaption', beforeCaption);
      if (afterCaption) formData.append('afterCaption', afterCaption);
      if (beforeYear) formData.append('beforeYear', beforeYear);
      if (afterYear) formData.append('afterYear', afterYear);

      const res = await beforeNowService.create(formData);
      setItems((prev) => [res.data.beforeNow, ...prev]);
      setShowCreate(false);
      resetCreate();
      toast.success('Comparison created!');
    } catch (err) {
      toast.error(err.message || 'Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleToggleLike = (id, isLiked, likesCount) => {
    setItems((prev) =>
      prev.map((i) => i.id === id ? { ...i, isLiked, likesCount } : i)
    );
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <HiSparkles className="w-6 h-6 text-accent" />
            Before vs Now
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">See how far you've come</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-accent rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
        >
          <HiPlus className="w-4 h-4" />
          Create
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-card rounded-xl p-1 border border-dark-border">
        <button
          onClick={() => setTab('feed')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'feed' ? 'bg-dark-surface text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <HiArrowTrendingUp className="w-4 h-4" />
          For You
        </button>
        <button
          onClick={() => setTab('explore')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'explore' ? 'bg-dark-surface text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <HiSparkles className="w-4 h-4" />
          Explore
        </button>
      </div>

      {/* Feed */}
      {loading && items.length === 0 ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <PostSkeleton key={i} />)}
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} ref={index === items.length - 1 ? lastRef : null}>
              <BeforeNowCard
                item={item}
                onDelete={handleDelete}
                onToggleLike={handleToggleLike}
              />
            </div>
          ))}
          {loading && (
            <div className="flex justify-center py-2">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!hasMore && items.length > 0 && (
            <p className="text-center text-gray-600 text-xs py-2">You've seen it all</p>
          )}
        </div>
      ) : (
        <div className="text-center py-16">
          <HiSparkles className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No comparisons yet</p>
          <p className="text-gray-600 text-sm mt-1">Be the first to share your transformation</p>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); resetCreate(); }} title="Before vs Now" size="md">
        <div className="p-6 space-y-5">
          {/* Photo Upload Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Before Photo */}
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Before</p>
              <input
                ref={beforeRef}
                type="file"
                accept="image/*"
                onChange={handleBeforeFile}
                className="hidden"
              />
              <button
                onClick={() => beforeRef.current?.click()}
                className={`w-full aspect-square rounded-2xl border-2 border-dashed transition-all overflow-hidden ${
                  beforePreview
                    ? 'border-primary/50'
                    : 'border-dark-border hover:border-primary/30 bg-dark-surface'
                }`}
              >
                {beforePreview ? (
                  <img src={beforePreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
                    <HiPlus className="w-6 h-6" />
                    <span className="text-xs">Old Photo</span>
                  </div>
                )}
              </button>
            </div>

            {/* After Photo */}
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Now</p>
              <input
                ref={afterRef}
                type="file"
                accept="image/*"
                onChange={handleAfterFile}
                className="hidden"
              />
              <button
                onClick={() => afterRef.current?.click()}
                className={`w-full aspect-square rounded-2xl border-2 border-dashed transition-all overflow-hidden ${
                  afterPreview
                    ? 'border-accent/50'
                    : 'border-dark-border hover:border-accent/30 bg-dark-surface'
                }`}
              >
                {afterPreview ? (
                  <img src={afterPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
                    <HiPlus className="w-6 h-6" />
                    <span className="text-xs">Current Photo</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Preview */}
          {beforePreview && afterPreview && (
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-dark-border">
              <img src={afterPreview} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(0 50% 0 0)' }}>
                <img src={beforePreview} alt="" className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/60 -translate-x-1/2" />
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 rounded-full text-[10px] font-semibold text-white uppercase">Before</div>
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 rounded-full text-[10px] font-semibold text-white uppercase">Now</div>
            </div>
          )}

          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give it a title (optional)"
            className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
          />

          {/* Year Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Before Year</label>
              <input
                value={beforeYear}
                onChange={(e) => setBeforeYear(e.target.value)}
                placeholder="e.g. 2019"
                className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Now Year</label>
              <input
                value={afterYear}
                onChange={(e) => setAfterYear(e.target.value)}
                placeholder="e.g. 2026"
                className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          {/* Captions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Before Caption</label>
              <input
                value={beforeCaption}
                onChange={(e) => setBeforeCaption(e.target.value)}
                placeholder="Shy kid..."
                maxLength={200}
                className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Now Caption</label>
              <input
                value={afterCaption}
                onChange={(e) => setAfterCaption(e.target.value)}
                placeholder="Confident leader!"
                maxLength={200}
                className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleCreate}
              loading={creating}
              disabled={!beforeFile || !afterFile}
              className="flex-1 bg-gradient-to-r from-primary to-accent"
            >
              Share Comparison
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BeforeNowPage;

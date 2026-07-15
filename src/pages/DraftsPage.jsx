import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiDocumentDuplicate, HiFilm, HiCalendarDays,
  HiTrash, HiPlay, HiPencilSquare, HiArrowUpTray,
} from 'react-icons/hi2';
import { draftService } from '../services';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { cn } from '../utils';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'all', label: 'All', icon: HiDocumentDuplicate },
  { key: 'post', label: 'Posts', icon: HiPencilSquare },
  { key: 'reel', label: 'Reels', icon: HiFilm },
  { type: 'memory', key: 'memory', label: 'Memories', icon: HiCalendarDays },
];

const TYPE_BADGES = {
  post: { label: 'Post', bg: 'bg-blue-500/15 text-blue-400' },
  reel: { label: 'Reel', bg: 'bg-rose-500/15 text-rose-400' },
  memory: { label: 'Memory', bg: 'bg-amber-500/15 text-amber-400' },
};

function DraftCard({ draft, onPublish, onDelete }) {
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const badge = TYPE_BADGES[draft.type] || TYPE_BADGES.post;
  const hasMedia = (draft.images?.length > 0) || (draft.videos?.length > 0);
  const firstImage = draft.images?.[0];
  const firstVideo = draft.videos?.[0];

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await onPublish(draft.id);
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(draft.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden"
    >
      {/* Media preview */}
      {hasMedia && (
        <div className="relative h-36 bg-dark-surface">
          {firstImage ? (
            <img src={firstImage} alt="" className="w-full h-full object-cover" />
          ) : firstVideo ? (
            <div className="w-full h-full relative">
              <video src={firstVideo} className="w-full h-full object-cover" preload="metadata" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <HiPlay className="w-8 h-8 text-white/80 fill-current" />
              </div>
            </div>
          ) : null}
          {(draft.images?.length > 1 || draft.videos?.length > 0) && (
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 rounded-full text-[10px] text-white font-medium">
              +{(draft.images?.length || 0) + (draft.videos?.length || 0) - 1} more
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold', badge.bg)}>
            {badge.label}
          </span>
          <p className="text-[11px] text-gray-600">
            {new Date(draft.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {draft.content && (
          <p className="text-sm text-gray-300 line-clamp-3 mb-3 whitespace-pre-wrap">{draft.content}</p>
        )}

        {!draft.content && !hasMedia && (
          <p className="text-sm text-gray-600 italic mb-3">Empty draft</p>
        )}

        <div className="flex items-center gap-2 pt-2 border-t border-dark-border">
          <Button
            variant="primary"
            size="sm"
            onClick={handlePublish}
            loading={publishing}
            disabled={publishing || (!draft.content && !hasMedia)}
            className="flex-1"
          >
            <HiArrowUpTray className="w-3.5 h-3.5" />
            Publish
          </Button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
          >
            <HiTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// --- All Tab Section ---

function DraftSection({ icon: Icon, label, items, onPublish, onDelete, accent }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${accent}`} />
        <h3 className="text-sm font-semibold text-gray-300">{label}</h3>
        <span className="text-[11px] text-gray-600">({items.length})</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map((draft) => (
          <DraftCard key={draft.id} draft={draft} onPublish={onPublish} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

// --- Main Page ---

const DraftsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(1);
  const observerRef = useRef(null);

  const fetchDrafts = useCallback(async (type = 'all', pageNum = 1, append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await draftService.getDrafts({ type, page: pageNum, limit: 20 });
      const data = res.data;

      if (type === 'all') {
        const allDrafts = data.data || [];
        const grouped = { post: [], reel: [], memory: [] };
        allDrafts.forEach((d) => {
          if (grouped[d.type]) grouped[d.type].push(d);
        });
        setResults(grouped);
        setHasMore(data.pagination?.hasNext || false);
      } else {
        const items = data.data || [];
        if (append) {
          setResults((prev) => ({ ...prev, [type]: [...(prev[type] || []), ...items] }));
        } else {
          setResults({ [type]: items });
        }
        setHasMore(data.pagination?.hasNext || false);
      }
    } catch {
      toast.error('Failed to load drafts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchDrafts('all');
  }, [fetchDrafts]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    pageRef.current = 1;
    setPage(1);
    setHasMore(true);
    fetchDrafts(tab, 1, false);
  }, [fetchDrafts]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || activeTab === 'all') return;
    pageRef.current += 1;
    setPage(pageRef.current);
    fetchDrafts(activeTab, pageRef.current, true);
  }, [activeTab, loadingMore, hasMore, fetchDrafts]);

  useEffect(() => {
    if (activeTab === 'all') return;
    const node = observerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [activeTab, loadMore]);

  const handlePublish = useCallback(async (draftId) => {
    try {
      await draftService.publishDraft(draftId);
      toast.success('Draft published!');
      setResults((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          next[key] = next[key].filter((d) => d.id !== draftId);
        }
        return next;
      });
    } catch {
      toast.error('Failed to publish');
    }
  }, []);

  const handleDelete = useCallback(async (draftId) => {
    try {
      await draftService.deleteDraft(draftId);
      toast.success('Draft deleted');
      setResults((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          next[key] = next[key].filter((d) => d.id !== draftId);
        }
        return next;
      });
    } catch {
      toast.error('Failed to delete');
    }
  }, []);

  const renderItems = useCallback((type) => {
    const items = results[type] || [];
    if (type === 'reel' || type === 'memory') {
      return (
        <div className="grid grid-cols-2 gap-3">
          {items.map((draft) => (
            <DraftCard key={draft.id} draft={draft} onPublish={handlePublish} onDelete={handleDelete} />
          ))}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 gap-3">
        {items.map((draft) => (
          <DraftCard key={draft.id} draft={draft} onPublish={handlePublish} onDelete={handleDelete} />
        ))}
      </div>
    );
  }, [handlePublish, handleDelete]);

  const totalAll = Object.values(results).reduce((sum, arr) => sum + (arr?.length || 0), 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Drafts</h1>
        <p className="text-sm text-gray-500">Unfinished posts saved as drafts</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1" style={{ scrollbarWidth: 'none' }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0',
                activeTab === tab.key
                  ? 'bg-primary/15 text-primary-light border border-primary/20'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-dark-card border border-transparent'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Content */}
      {!loading && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'all' ? (
              <div className="space-y-8">
                <DraftSection icon={HiPencilSquare} label="Posts" items={results.post} onPublish={handlePublish} onDelete={handleDelete} accent="text-blue-400" />
                <DraftSection icon={HiFilm} label="Reels" items={results.reel} onPublish={handlePublish} onDelete={handleDelete} accent="text-rose-400" />
                <DraftSection icon={HiCalendarDays} label="Memories" items={results.memory} onPublish={handlePublish} onDelete={handleDelete} accent="text-amber-400" />
                {totalAll === 0 && (
                  <div className="text-center py-16">
                    <HiDocumentDuplicate className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No drafts yet</p>
                    <p className="text-gray-600 text-sm mt-1">Save a post as a draft from the create modal</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {renderItems(activeTab)}

                {hasMore && (
                  <div ref={observerRef} className="flex justify-center py-4">
                    {loadingMore && (
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                )}

                {!hasMore && (results[activeTab]?.length || 0) > 0 && (
                  <p className="text-center text-gray-600 text-xs py-4">End of drafts</p>
                )}

                {(results[activeTab]?.length || 0) === 0 && (
                  <div className="text-center py-16">
                    <HiDocumentDuplicate className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No drafts here</p>
                    <p className="text-gray-600 text-sm mt-1">Save from the create modal</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default DraftsPage;

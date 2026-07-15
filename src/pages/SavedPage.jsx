import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiBookmark, HiHeart, HiFilm, HiPhoto, HiCalendarDays,
  HiChatBubbleLeft, HiClock, HiMapPin,
} from 'react-icons/hi2';
import { savedItemService } from '../services';
import Avatar from '../components/ui/Avatar';
import SaveButton from '../components/ui/SaveButton';
import { formatNumber, cn } from '../utils';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'all', label: 'All', icon: HiBookmark },
  { key: 'post', label: 'Posts', icon: HiHeart },
  { key: 'memory', label: 'Memories', icon: HiHeart },
  { key: 'reel', label: 'Reels', icon: HiFilm },
  { key: 'album', label: 'Albums', icon: HiPhoto },
  { key: 'event', label: 'Events', icon: HiCalendarDays },
];

// --- Card Components ---

function PostCard({ item }) {
  const img = item.images?.[0];
  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden group">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Link to={`/profile/${item.author?.id}`}>
            <Avatar src={item.author?.profilePhoto} name={item.author?.fullName} size="sm" />
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/profile/${item.author?.id}`} className="text-sm font-semibold text-white hover:underline truncate block">
              {item.author?.fullName}
            </Link>
            <p className="text-[11px] text-gray-500">
              {item.school?.name && <span>{item.school.name} · </span>}
              {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <SaveButton itemType="post" itemId={item.id} size="sm" />
        </div>
        {item.content && (
          <Link to={`/post/${item.id}`}>
            <p className="text-sm text-gray-200 whitespace-pre-wrap line-clamp-3 mb-3">{item.content}</p>
          </Link>
        )}
        {img && (
          <Link to={`/post/${item.id}`} className="block">
            <img src={img} alt="" className="w-full h-48 object-cover rounded-xl" />
          </Link>
        )}
        <div className="flex items-center gap-4 mt-3 pt-2 border-t border-dark-border text-xs text-gray-500">
          <span className="flex items-center gap-1"><HiHeart className="w-3.5 h-3.5" /> {item.likesCount || 0}</span>
          <span className="flex items-center gap-1"><HiChatBubbleLeft className="w-3.5 h-3.5" /> {item.commentsCount || 0}</span>
        </div>
      </div>
    </div>
  );
}

function ReelCard({ item }) {
  const thumb = item.videos?.[0] || item.images?.[0];
  return (
    <Link
      to={`/post/${item.id}`}
      className="block rounded-2xl overflow-hidden relative group bg-dark-card border border-dark-border hover:border-primary/20 transition-all"
    >
      <div className="aspect-[9/16] max-h-64 relative">
        {thumb ? (
          item.videos?.length > 0 ? (
            <video src={thumb} className="w-full h-full object-cover" preload="metadata" />
          ) : (
            <img src={thumb} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-dark-surface">
            <HiFilm className="w-8 h-8 text-gray-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute top-2 right-2">
          <SaveButton itemType="reel" itemId={item.id} size="sm" />
        </div>
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-white text-xs line-clamp-2 font-medium">{item.content}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-white/70 text-[10px]">
              <HiHeart className="w-3 h-3" /> {formatNumber(item.likesCount)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function MemoryCard({ item }) {
  const img = item.images?.[0];
  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Link to={`/profile/${item.author?.id}`}>
            <Avatar src={item.author?.profilePhoto} name={item.author?.fullName} size="sm" />
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/profile/${item.author?.id}`} className="text-sm font-semibold text-white hover:underline truncate block">
              {item.author?.fullName}
            </Link>
            <p className="text-[11px] text-gray-500">
              {item.school?.name && <span>{item.school.name} · </span>}
              {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <span className="px-2 py-0.5 bg-accent/20 text-accent-light text-[10px] font-semibold rounded-full uppercase">Memory</span>
          <SaveButton itemType="memory" itemId={item.id} size="sm" />
        </div>
        {item.content && (
          <Link to={`/post/${item.id}`}>
            <p className="text-sm text-gray-200 whitespace-pre-wrap line-clamp-3 mb-3">{item.content}</p>
          </Link>
        )}
        {img && (
          <Link to={`/post/${item.id}`} className="block">
            <img src={img} alt="" className="w-full h-48 object-cover rounded-xl" />
          </Link>
        )}
      </div>
    </div>
  );
}

function AlbumCard({ item }) {
  return (
    <Link
      to={`/albums/${item.id}`}
      className="block bg-dark-card border border-dark-border rounded-2xl overflow-hidden hover:border-primary/20 transition-all group"
    >
      {item.coverImage ? (
        <div className="h-36 relative">
          <img src={item.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      ) : (
        <div className="h-36 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
          <HiPhoto className="w-10 h-10 text-primary/30" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white text-sm truncate group-hover:text-primary-light transition-colors">{item.name}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{item.postsCount || 0} items</p>
          </div>
          <SaveButton itemType="album" itemId={item.id} size="sm" />
        </div>
        {item.author && (
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-dark-border">
            <Avatar src={item.author.profilePhoto} name={item.author.fullName} size="xs" />
            <span className="text-[11px] text-gray-400">{item.author.fullName}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

function EventCard({ item }) {
  const isPast = new Date(item.eventDate) < new Date();
  return (
    <Link
      to={`/events/${item.id}`}
      className="block bg-dark-card border border-dark-border rounded-2xl overflow-hidden hover:border-primary/20 transition-all group"
    >
      {item.coverImage && (
        <div className="h-32 relative">
          <img src={item.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white text-sm truncate group-hover:text-primary-light transition-colors">{item.title}</p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
              <span className="flex items-center gap-1">
                <HiClock className="w-3 h-3" />
                {new Date(item.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              {item.location && (
                <span className="flex items-center gap-1 truncate">
                  <HiMapPin className="w-3 h-3" />{item.location}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-[10px] px-2 py-0.5 rounded-full font-medium',
              isPast ? 'bg-gray-500/10 text-gray-500' : 'bg-emerald-500/10 text-emerald-400'
            )}>
              {isPast ? 'Past' : 'Upcoming'}
            </span>
            <SaveButton itemType="event" itemId={item.id} size="sm" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// --- All Tab Section ---

function AllSection({ icon: Icon, label, items, renderItem, accent }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${accent}`} />
        <h3 className="text-sm font-semibold text-gray-300">{label}</h3>
        <span className="text-[11px] text-gray-600">({items.length})</span>
      </div>
      <div className="space-y-3">
        {items.map((item) => renderItem(item))}
      </div>
    </div>
  );
}

// --- Main Page ---

const SavedPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(1);
  const observerRef = useRef(null);

  const fetchSaved = useCallback(async (type = 'all', pageNum = 1, append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await savedItemService.getSaved({ type, page: pageNum, limit: 20 });
      const data = res.data;

      if (type === 'all') {
        setResults(data.results || {});
        setHasMore(false);
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
      toast.error('Failed to load saved items');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchSaved('all');
  }, [fetchSaved]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    pageRef.current = 1;
    setPage(1);
    setHasMore(true);
    fetchSaved(tab, 1, false);
  }, [fetchSaved]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || activeTab === 'all') return;
    pageRef.current += 1;
    setPage(pageRef.current);
    fetchSaved(activeTab, pageRef.current, true);
  }, [activeTab, loadingMore, hasMore, fetchSaved]);

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

  const renderItems = useCallback((type) => {
    const items = results[type] || [];
    switch (type) {
      case 'post': return items.map((item) => <PostCard key={item.id} item={item} />);
      case 'memory': return items.map((item) => <MemoryCard key={item.id} item={item} />);
      case 'reel': return (
        <div className="grid grid-cols-3 gap-3">
          {items.map((item) => <ReelCard key={item.id} item={item} />)}
        </div>
      );
      case 'album': return (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => <AlbumCard key={item.id} item={item} />)}
        </div>
      );
      case 'event': return items.map((item) => <EventCard key={item.id} item={item} />);
      default: return null;
    }
  }, []);

  const totalAll = Object.values(results).reduce((sum, arr) => sum + (arr?.length || 0), 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Saved</h1>
        <p className="text-sm text-gray-500">Your bookmarked posts, reels, and memories</p>
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
                <AllSection icon={HiHeart} label="Posts" items={results.post} renderItem={(i) => <PostCard key={i.id} item={i} />} accent="text-rose-400" />
                <AllSection icon={HiHeart} label="Memories" items={results.memory} renderItem={(i) => <MemoryCard key={i.id} item={i} />} accent="text-amber-400" />
                <AllSection icon={HiFilm} label="Reels" items={results.reel} renderItem={(i) => <ReelCard key={i.id} item={i} />} accent="text-purple-400" />
                <AllSection icon={HiPhoto} label="Albums" items={results.album} renderItem={(i) => <AlbumCard key={i.id} item={i} />} accent="text-blue-400" />
                <AllSection icon={HiCalendarDays} label="Events" items={results.event} renderItem={(i) => <EventCard key={i.id} item={i} />} accent="text-emerald-400" />
                {totalAll === 0 && (
                  <div className="text-center py-16">
                    <HiBookmark className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No saved items yet</p>
                    <p className="text-gray-600 text-sm mt-1">Tap the bookmark icon on any post to save it here</p>
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
                  <p className="text-center text-gray-600 text-xs py-4">End of saved items</p>
                )}

                {(results[activeTab]?.length || 0) === 0 && (
                  <div className="text-center py-16">
                    <HiBookmark className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No saved {activeTab === 'post' ? 'posts' : activeTab === 'memory' ? 'memories' : activeTab === 'reel' ? 'reels' : activeTab === 'album' ? 'albums' : 'events'} yet</p>
                    <p className="text-gray-600 text-sm mt-1">Tap the bookmark icon to save them here</p>
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

export default SavedPage;

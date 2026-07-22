import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { postService } from '../services';
import PostCard from '../components/feed/PostCard';
import { PostSkeleton } from '../components/ui/Skeleton';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import toast from 'react-hot-toast';

const ReelsPage = () => {
  const [reels, setReels] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchReels = useCallback(async (pageNum = 1) => {
    try {
      const res = await postService.getFeed({ page: pageNum, limit: 20, type: 'reel' });
      const data = res.data;
      const newReels = data.data || [];
      if (pageNum === 1) {
        setReels(newReels);
      } else {
        setReels((prev) => [...prev, ...newReels]);
      }
      setHasMore(data.pagination?.hasNext || false);
    } catch {
      toast.error('Failed to load reels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReels(1);
  }, [fetchReels]);

  const fetchMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReels(nextPage);
  }, [page, fetchReels]);

  const lastRef = useInfiniteScroll(fetchMore, hasMore, loading);

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white mb-1">Reels</h1>
        <p className="text-gray-500 text-sm">Discover short video memories</p>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <PostSkeleton key={i} />)}
        </div>
      ) : (
        <div className="space-y-4">
          {reels.map((reel, index) => (
            <div key={reel.id} ref={index === reels.length - 1 ? lastRef : null}>
              <PostCard post={reel} />
            </div>
          ))}
          {!hasMore && reels.length > 0 && (
            <p className="text-center text-gray-600 text-sm py-4">No more reels</p>
          )}
          {reels.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500">No reels yet. Share your first short video!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReelsPage;

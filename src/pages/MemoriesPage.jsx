import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { postService } from '../services';
import PostCard from '../components/feed/PostCard';
import { PostSkeleton } from '../components/ui/Skeleton';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import toast from 'react-hot-toast';

const MemoriesPage = () => {
  const [memories, setMemories] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchMemories = useCallback(async (pageNum = 1) => {
    try {
      const res = await postService.getFeed({ page: pageNum, limit: 20, type: 'memory' });
      const data = res.data;
      const newMemories = data.data || [];
      if (pageNum === 1) {
        setMemories(newMemories);
      } else {
        setMemories((prev) => [...prev, ...newMemories]);
      }
      setHasMore(data.pagination?.hasNext || false);
    } catch {
      toast.error('Failed to load memories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemories(1);
  }, [fetchMemories]);

  const fetchMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMemories(nextPage);
  }, [page, fetchMemories]);

  const lastRef = useInfiniteScroll(fetchMore, hasMore, loading);

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white mb-1">Memories</h1>
        <p className="text-gray-500 text-sm">Relive your school moments</p>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <PostSkeleton key={i} />)}
        </div>
      ) : (
        <div className="space-y-4">
          {memories.map((memory, index) => (
            <div key={memory.id} ref={index === memories.length - 1 ? lastRef : null}>
              <PostCard post={memory} />
            </div>
          ))}
          {!hasMore && memories.length > 0 && (
            <p className="text-center text-gray-600 text-sm py-4">No more memories</p>
          )}
          {memories.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500">No memories yet. Share your first school memory!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MemoriesPage;
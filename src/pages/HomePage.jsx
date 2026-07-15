import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiMagnifyingGlass, HiFilm, HiCalendarDays, HiUserGroup, HiGlobeAlt,
  HiPlus, HiClock, HiAcademicCap,
} from 'react-icons/hi2';
import { useAuth } from '../contexts/AuthContext';
import CreatePost from '../components/feed/CreatePost';
import PostCard from '../components/feed/PostCard';
import { PostSkeleton } from '../components/ui/Skeleton';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import { postService, onThisDayService } from '../services';
import { cn } from '../utils';
import toast from 'react-hot-toast';

const stories = [
  { id: 'add', label: 'Add Memory', icon: HiPlus, gradient: 'from-primary to-accent', path: null },
  { id: 'story', label: 'My Story', icon: HiClock, gradient: 'from-purple-500 to-pink-500', path: '/memories' },
  { id: 'reels', label: 'Reels', icon: HiFilm, gradient: 'from-red-500 to-orange-500', path: '/reels' },
  { id: 'onthiday', label: 'On This Day', icon: HiCalendarDays, gradient: 'from-blue-500 to-cyan-500', path: '/on-this-day' },
  { id: 'throwback', label: 'Throwback', icon: HiClock, gradient: 'from-amber-500 to-yellow-500', path: '/before-now' },
  { id: 'vibes', label: 'School Vibes', icon: HiAcademicCap, gradient: 'from-emerald-500 to-teal-500', path: '/communities' },
];

const feedTabs = ['For You', 'Memories', 'Reels', 'Communities', 'Following'];

const HomePage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('For You');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPosts = useCallback(async (pageNum = 1) => {
    try {
      const res = await postService.getFeed({ page: pageNum, limit: 20 });
      const newPosts = res.data.data;
      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }
      setHasMore(res.data.pagination.hasNext);
    } catch (err) {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const fetchMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  }, [page, fetchPosts]);

  const lastPostRef = useInfiniteScroll(fetchMore, hasMore, loading);

  const handlePostCreated = () => {
    setPage(1);
    fetchPosts(1);
  };

  const handleDeletePost = async (postId) => {
    try {
      await postService.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  return (
    <div className="space-y-4">
      {/* Mobile Search */}
      <div className="md:hidden">
        <div className="relative">
          <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories, people, schools..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-dark-surface border border-dark-border text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Stories / Shortcuts */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar py-1 -mx-1 px-1">
        {stories.map((story) => (
          story.path ? (
            <Link
              key={story.id}
              to={story.path}
              className="flex flex-col items-center gap-2 shrink-0 group"
            >
              <div className={cn(
                'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center transition-transform group-hover:scale-105',
                story.gradient
              )}>
                <story.icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-[10px] font-medium text-gray-400 group-hover:text-white transition-colors whitespace-nowrap">
                {story.label}
              </span>
            </Link>
          ) : (
            <button
              key={story.id}
              onClick={() => toast('Coming soon!')}
              className="flex flex-col items-center gap-2 shrink-0 group"
            >
              <div className={cn(
                'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center transition-transform group-hover:scale-105',
                story.gradient
              )}>
                <story.icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-[10px] font-medium text-gray-400 group-hover:text-white transition-colors whitespace-nowrap">
                {story.label}
              </span>
            </button>
          )
        ))}
      </div>

      {/* Feed Tabs */}
      <div className="flex items-center gap-1 border-b border-dark-border pb-0">
        {feedTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'relative px-4 py-3 text-sm font-medium transition-all',
              activeTab === tab ? 'tab-active' : 'text-gray-500 hover:text-gray-300'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Create Post */}
      <CreatePost onPostCreated={handlePostCreated} />

      {/* Feed */}
      {loading && posts.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {posts.map((post, index) => (
              <div
                key={post.id}
                ref={index === posts.length - 1 ? lastPostRef : null}
              >
                <PostCard post={post} onDelete={handleDeletePost} />
              </div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <PostSkeleton key={`loading-${i}`} />
              ))}
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 text-xs">You're all caught up</p>
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <HiGlobeAlt className="w-8 h-8 text-primary-light/50" />
              </div>
              <p className="text-gray-400 text-sm font-medium mb-1">Your feed is empty</p>
              <p className="text-gray-600 text-xs">Follow people and join communities to see posts here</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HiSparkles, HiArrowRight, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { recommendationService } from '../../services';
import Avatar from '../ui/Avatar';
import { formatDate } from '../../utils';

const REASON_ICONS = {
  'From your school': { emoji: '🏫', color: 'bg-blue-500/10 text-blue-400' },
  'From someone you follow': { emoji: '👥', color: 'bg-emerald-500/10 text-emerald-400' },
  'Trending now': { emoji: '🔥', color: 'bg-rose-500/10 text-rose-400' },
  'Matches your interests': { emoji: '💡', color: 'bg-amber-500/10 text-amber-400' },
  'Recently posted': { emoji: '⏰', color: 'bg-gray-500/10 text-gray-400' },
};

function RecommendationCard({ post, index }) {
  const rec = post._recommendation;
  const reasonInfo = REASON_ICONS[rec?.reason] || { emoji: '✨', color: 'bg-primary/10 text-primary-light' };
  const hasMedia = post.images?.length > 0 || post.videos?.length > 0;

  return (
    <Link
      to={`/post/${post.id}`}
      className="shrink-0 w-56 snap-start group"
    >
      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden hover:border-primary/20 transition-all duration-300">
        {hasMedia ? (
          <div className="h-32 relative overflow-hidden">
            {post.videos?.length > 0 ? (
              <video
                src={post.videos[0]}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                preload="metadata"
              />
            ) : (
              <img
                src={post.images[0]}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {rec?.score > 0.7 && (
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-primary/20 backdrop-blur-sm">
                <HiSparkles className="w-3 h-3 text-primary-light" />
              </div>
            )}
          </div>
        ) : (
          <div className="h-32 p-4 flex items-center bg-gradient-to-br from-dark-surface to-dark-card">
            <p className="text-gray-300 text-xs line-clamp-4 leading-relaxed">{post.content}</p>
          </div>
        )}

        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Avatar src={post.author?.profilePhoto} name={post.author?.fullName} size="xs" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{post.author?.fullName}</p>
              <p className="text-[10px] text-gray-500">@{post.author?.username}</p>
            </div>
          </div>

          {post.content && hasMedia && (
            <p className="text-[11px] text-gray-400 line-clamp-2 mb-2">{post.content}</p>
          )}

          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium ${reasonInfo.color}`}>
              <span>{reasonInfo.emoji}</span>
              {rec?.reason}
            </span>
            {post.school && (
              <span className="text-[9px] text-gray-600 truncate max-w-[80px]">{post.school.name}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function RecommendedMemories({ limit = 12 }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await recommendationService.getRecommendations({ limit, refresh: 'false' });
        setPosts(res.data.posts || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [limit]);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 240, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="glass-card-solid p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-dark-surface" />
          <div className="h-4 w-32 rounded bg-dark-surface" />
        </div>
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="shrink-0 w-56 h-64 rounded-2xl bg-dark-surface" />
          ))}
        </div>
      </div>
    );
  }

  if (error || posts.length === 0) return null;

  return (
    <div className="glass-card-solid p-5 relative group">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <HiSparkles className="w-4 h-4 text-primary-light" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Recommended For You</h3>
          <p className="text-[10px] text-gray-500">Based on your school, friends, and interests</p>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-dark-card/90 border border-dark-border flex items-center justify-center text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <HiChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none' }}
        >
          {posts.map((post, i) => (
            <RecommendationCard key={post.id} post={post} index={i} />
          ))}
        </div>

        <button
          onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-dark-card/90 border border-dark-border flex items-center justify-center text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <HiChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

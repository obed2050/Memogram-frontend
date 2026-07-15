import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineArrowsPointingIn } from 'react-icons/hi2';
import { recommendationService } from '../../services';
import Avatar from '../ui/Avatar';

export default function SimilarPosts({ postId, limit = 6 }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;
    const fetch = async () => {
      try {
        const res = await recommendationService.getSimilarPosts(postId, { limit });
        setPosts(res.data.posts || []);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetch();
  }, [postId, limit]);

  if (loading || posts.length === 0) return null;

  return (
    <div className="glass-card-solid p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <HiOutlineArrowsPointingIn className="w-4 h-4 text-primary-light" />
        </div>
        <h3 className="text-sm font-bold text-white">Similar Posts</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/post/${post.id}`}
            className="group rounded-xl overflow-hidden bg-dark-surface border border-dark-border hover:border-primary/20 transition-colors"
          >
            {post.images?.[0] ? (
              <div className="h-24 relative overflow-hidden">
                <img src={post.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            ) : (
              <div className="h-24 p-3 flex items-center">
                <p className="text-gray-400 text-[11px] line-clamp-3">{post.content}</p>
              </div>
            )}
            <div className="p-2.5 flex items-center gap-2">
              <Avatar src={post.author?.profilePhoto} name={post.author?.fullName} size="xs" />
              <div className="min-w-0">
                <p className="text-[11px] text-white font-medium truncate">{post.author?.fullName}</p>
                <p className="text-[9px] text-gray-500">{post.likesCount || 0} likes</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

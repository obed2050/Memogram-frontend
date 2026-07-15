import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi2';
import { postService, commentService, likeService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/feed/PostCard';
import Avatar from '../components/ui/Avatar';
import { BadgePill } from '../components/badges/BadgeDisplay';
import SimilarPosts from '../components/recommendations/SimilarPosts';
import Button from '../components/ui/Button';
import { PostSkeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

const PostDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          postService.getPostById(id),
          commentService.getComments(id),
        ]);
        setPost(postRes.data.post);
        setComments(commentsRes.data.data);
      } catch {
        toast.error('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleComment = async () => {
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      const res = await commentService.createComment({
        postId: id,
        content: newComment,
      });
      setComments((prev) => [res.data.comment, ...prev]);
      setNewComment('');
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) return <PostSkeleton />;
  if (!post) return <div className="text-center py-16 text-gray-500">Post not found</div>;

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/" className="p-2 rounded-xl hover:bg-dark-surface text-gray-400">
          <HiArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-lg font-semibold text-white">Post</h1>
      </div>

      <PostCard post={post} />

      <SimilarPosts postId={post.id} limit={6} />

      {/* Comments */}
      <div className="bg-dark-card rounded-2xl border border-dark-border p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-4">Comments</h3>

        {/* Add Comment */}
        <div className="flex items-start gap-3 mb-6">
          <Avatar src={user?.profilePhoto} name={user?.fullName} size="sm" />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 resize-none focus:border-primary focus:outline-none"
              rows={2}
            />
            <div className="flex justify-end mt-2">
              <Button
                size="sm"
                onClick={handleComment}
                loading={commentLoading}
                disabled={!newComment.trim()}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>

        {/* Comment List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3">
              <Avatar src={comment.author?.profilePhoto} name={comment.author?.fullName} size="sm" />
              <div className="flex-1">
                <div className="bg-dark-surface rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-white">{comment.author?.fullName}</p>
                    {comment.author?.badges?.slice(0, 2).map((b) => (
                      <BadgePill key={b.badgeId} badge={b} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-300 mt-0.5">{comment.content}</p>
                </div>
                <div className="flex items-center gap-3 mt-1 px-2 text-xs text-gray-500">
                  <button className="hover:text-white transition-colors">Like</button>
                  <button className="hover:text-white transition-colors">Reply</button>
                </div>

                {/* Replies */}
                {comment.replies?.length > 0 && (
                  <div className="mt-3 ml-4 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2">
                        <Avatar src={reply.author?.profilePhoto} name={reply.author?.fullName} size="xs" />
                        <div className="bg-dark-surface rounded-xl px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-semibold text-white">{reply.author?.fullName}</p>
                            {reply.author?.badges?.slice(0, 1).map((b) => (
                              <BadgePill key={b.badgeId} badge={b} />
                            ))}
                          </div>
                          <p className="text-sm text-gray-300">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-4">No comments yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
import { useState, useEffect, useCallback } from 'react';
import { HiChatBubbleLeft, HiTrash } from 'react-icons/hi2';
import { beforeNowService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import toast from 'react-hot-toast';

const CommentItem = ({ comment, onDelete, onReply, user }) => (
  <div className="bg-dark-surface rounded-xl p-3">
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2 mb-1.5">
        <Avatar src={comment.author?.profilePhoto} name={comment.author?.fullName} size="xs" />
        <span className="text-xs font-medium text-white">{comment.author?.fullName}</span>
        <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
      </div>
      {comment.userId === user?.id && (
        <button onClick={() => onDelete(comment.id)} className="text-gray-600 hover:text-red-400 transition-colors">
          <HiTrash className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
    <p className="text-sm text-gray-300 whitespace-pre-wrap">{comment.content}</p>
    <div className="flex items-center gap-3 mt-2">
      <button onClick={() => onReply(comment)} className="text-xs text-primary-light hover:text-primary transition-colors">
        Reply
      </button>
      {comment.repliesCount > 0 && (
        <span className="text-xs text-gray-500">{comment.repliesCount} replies</span>
      )}
    </div>
  </div>
);

const ReplyItem = ({ reply, onDelete, user }) => (
  <div className="pl-4 border-l-2 border-dark-border">
    <div className="bg-dark-surface rounded-xl p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 mb-1.5">
          <Avatar src={reply.author?.profilePhoto} name={reply.author?.fullName} size="xs" />
          <span className="text-xs font-medium text-white">{reply.author?.fullName}</span>
          <span className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleDateString()}</span>
        </div>
        {reply.userId === user?.id && (
          <button onClick={() => onDelete(reply.id)} className="text-gray-600 hover:text-red-400 transition-colors">
            <HiTrash className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <p className="text-sm text-gray-300 whitespace-pre-wrap">{reply.content}</p>
    </div>
  </div>
);

const BeforeNowComments = ({ beforeNowId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replies, setReplies] = useState({});

  const fetchComments = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await beforeNowService.getComments(beforeNowId, { page: pageNum, limit: 20 });
      if (pageNum === 1) {
        setComments(res.data.data);
      } else {
        setComments((prev) => [...prev, ...res.data.data]);
      }
      setHasMore(res.data.pagination.hasNext);
    } catch {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [beforeNowId]);

  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]);

  const fetchMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage);
  }, [page, fetchComments]);

  const lastRef = useInfiniteScroll(fetchMore, hasMore, loading);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      setSubmitting(true);
      const res = await beforeNowService.createComment(beforeNowId, { content: content.trim() });
      setComments((prev) => [res.data.comment, ...prev]);
      setContent('');
      toast.success('Comment posted');
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !replyTo) return;
    try {
      setSubmitting(true);
      const res = await beforeNowService.createReply(beforeNowId, replyTo.id, { content: replyContent.trim() });
      setReplies((prev) => ({
        ...prev,
        [replyTo.id]: [...(prev[replyTo.id] || []), res.data.reply],
      }));
      setComments((prev) =>
        prev.map((c) => c.id === replyTo.id ? { ...c, repliesCount: (c.repliesCount || 0) + 1 } : c)
      );
      setReplyContent('');
      setReplyTo(null);
      toast.success('Reply posted');
    } catch {
      toast.error('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await beforeNowService.deleteComment(beforeNowId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const handleDeleteReply = async (replyId, parentCommentId) => {
    try {
      await beforeNowService.deleteReply(replyId);
      setReplies((prev) => ({
        ...prev,
        [parentCommentId]: (prev[parentCommentId] || []).filter((r) => r.id !== replyId),
      }));
      setComments((prev) =>
        prev.map((c) => c.id === parentCommentId ? { ...c, repliesCount: Math.max(0, (c.repliesCount || 0) - 1) } : c)
      );
      toast.success('Reply deleted');
    } catch {
      toast.error('Failed to delete reply');
    }
  };

  const toggleReplies = async (comment) => {
    const isExpanded = expandedReplies[comment.id];
    if (isExpanded) {
      setExpandedReplies((prev) => ({ ...prev, [comment.id]: false }));
    } else {
      if (!replies[comment.id]) {
        try {
          const res = await beforeNowService.getReplies(beforeNowId, comment.id, { limit: 50 });
          setReplies((prev) => ({ ...prev, [comment.id]: res.data.data }));
        } catch {
          toast.error('Failed to load replies');
        }
      }
      setExpandedReplies((prev) => ({ ...prev, [comment.id]: true }));
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-400">Comments</h3>

      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 bg-dark-surface border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
        />
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/80 disabled:opacity-50 transition-colors"
        >
          Post
        </button>
      </form>

      {loading && comments.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment, index) => (
            <div key={comment.id} ref={index === comments.length - 1 ? lastRef : null}>
              <CommentItem
                comment={comment}
                onDelete={handleDeleteComment}
                onReply={(c) => { setReplyTo(c); setReplyContent(''); }}
                user={user}
              />
              {comment.repliesCount > 0 && (
                <button
                  onClick={() => toggleReplies(comment)}
                  className="text-xs text-primary-light hover:text-primary ml-4 mt-1 transition-colors"
                >
                  {expandedReplies[comment.id] ? 'Hide replies' : `View ${comment.repliesCount} replies`}
                </button>
              )}
              {expandedReplies[comment.id] && replies[comment.id] && (
                <div className="space-y-2 mt-2 ml-4">
                  {replies[comment.id].map((reply) => (
                    <ReplyItem
                      key={reply.id}
                      reply={reply}
                      onDelete={(replyId) => handleDeleteReply(replyId, comment.id)}
                      user={user}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <HiChatBubbleLeft className="w-6 h-6 text-gray-600 mx-auto mb-1" />
          <p className="text-gray-500 text-xs">No comments yet</p>
        </div>
      )}

      {replyTo && (
        <form onSubmit={handleReply} className="flex gap-2 bg-dark-surface rounded-xl p-3 border border-dark-border">
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1.5">
              Replying to <span className="text-white">{replyTo.author?.fullName}</span>
            </p>
            <div className="flex gap-2">
              <input
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                autoFocus
              />
              <button
                type="submit"
                disabled={!replyContent.trim() || submitting}
                className="px-3 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/80 disabled:opacity-50 transition-colors"
              >
                Reply
              </button>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="px-3 py-2 text-gray-400 hover:text-white text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default BeforeNowComments;

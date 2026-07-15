import { useState, useEffect, useCallback } from 'react';
import { HiChatBubbleLeftRight, HiPlus, HiTrash } from 'react-icons/hi2';
import { generationService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import toast from 'react-hot-toast';

const DiscussionThread = ({ discussion, onDelete, onSelect }) => (
  <div
    onClick={() => onSelect(discussion)}
    className="bg-dark-surface rounded-xl border border-dark-border p-4 hover:border-dark-hover transition-colors cursor-pointer"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white mb-1 truncate">{discussion.title}</h4>
        {discussion.content && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-2">{discussion.content}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Avatar src={discussion.author?.profilePhoto} name={discussion.author?.fullName} size="xs" />
            <span>{discussion.author?.fullName}</span>
          </div>
          <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
          <span>{discussion.repliesCount} replies</span>
        </div>
      </div>
    </div>
  </div>
);

const DiscussionDetail = ({ discussion, onBack }) => {
  const { user } = useAuth();
  const [replies, setReplies] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchReplies = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await generationService.getReplies(discussion.id, { page: pageNum, limit: 20 });
      if (pageNum === 1) {
        setReplies(res.data.data);
      } else {
        setReplies((prev) => [...prev, ...res.data.data]);
      }
      setHasMore(res.data.pagination.hasNext);
    } catch {
      toast.error('Failed to load replies');
    } finally {
      setLoading(false);
    }
  }, [discussion.id]);

  useEffect(() => {
    fetchReplies(1);
  }, [fetchReplies]);

  const fetchMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReplies(nextPage);
  }, [page, fetchReplies]);

  const lastRef = useInfiniteScroll(fetchMore, hasMore, loading);

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      setSubmitting(true);
      const res = await generationService.createReply(discussion.id, { content: replyContent.trim() });
      setReplies((prev) => [...prev, res.data.reply]);
      setReplyContent('');
      toast.success('Reply posted');
    } catch {
      toast.error('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReply = async (replyId) => {
    try {
      await generationService.deleteReply(discussion.id, replyId);
      setReplies((prev) => prev.filter((r) => r.id !== replyId));
      toast.success('Reply deleted');
    } catch {
      toast.error('Failed to delete reply');
    }
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-xs text-primary-light hover:text-primary transition-colors">
        &larr; Back to discussions
      </button>

      <div className="bg-dark-surface rounded-xl border border-dark-border p-4">
        <h3 className="text-base font-semibold text-white mb-2">{discussion.title}</h3>
        {discussion.content && (
          <p className="text-sm text-gray-300 whitespace-pre-wrap mb-3">{discussion.content}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Avatar src={discussion.author?.profilePhoto} name={discussion.author?.fullName} size="xs" />
          <span>{discussion.author?.fullName}</span>
          <span>&middot;</span>
          <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="space-y-3">
        {loading && replies.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : replies.length > 0 ? (
          replies.map((reply, index) => (
            <div
              key={reply.id}
              ref={index === replies.length - 1 ? lastRef : null}
              className="bg-dark-card rounded-xl border border-dark-border p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Avatar src={reply.author?.profilePhoto} name={reply.author?.fullName} size="xs" />
                  <span className="text-white font-medium">{reply.author?.fullName}</span>
                  <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                </div>
                {reply.userId === user?.id && (
                  <button
                    onClick={() => handleDeleteReply(reply.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <HiTrash className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-300 whitespace-pre-wrap mt-1">{reply.content}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 text-xs py-4">No replies yet</p>
        )}
        {loading && replies.length > 0 && (
          <div className="flex justify-center py-2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmitReply} className="flex gap-2">
        <input
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder="Write a reply..."
          className="flex-1 bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
        />
        <button
          type="submit"
          disabled={!replyContent.trim() || submitting}
          className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? '...' : 'Reply'}
        </button>
      </form>
    </div>
  );
};

const GenerationDiscussions = ({ schoolId, generation }) => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);

  const fetchDiscussions = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await generationService.getDiscussions(schoolId, generation, { page: pageNum, limit: 20 });
      if (pageNum === 1) {
        setDiscussions(res.data.data);
      } else {
        setDiscussions((prev) => [...prev, ...res.data.data]);
      }
      setHasMore(res.data.pagination.hasNext);
    } catch {
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  }, [schoolId, generation]);

  useEffect(() => {
    fetchDiscussions(1);
  }, [fetchDiscussions]);

  const fetchMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDiscussions(nextPage);
  }, [page, fetchDiscussions]);

  const lastRef = useInfiniteScroll(fetchMore, hasMore, loading);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setCreating(true);
      const res = await generationService.createDiscussion(schoolId, generation, {
        title: newTitle.trim(),
        content: newContent.trim() || undefined,
      });
      setDiscussions((prev) => [res.data.discussion, ...prev]);
      setNewTitle('');
      setNewContent('');
      setShowCreate(false);
      toast.success('Discussion created');
    } catch {
      toast.error('Failed to create discussion');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (discussionId) => {
    try {
      await generationService.deleteDiscussion(discussionId);
      setDiscussions((prev) => prev.filter((d) => d.id !== discussionId));
      toast.success('Discussion deleted');
    } catch {
      toast.error('Failed to delete discussion');
    }
  };

  if (selectedDiscussion) {
    return (
      <DiscussionDetail
        discussion={selectedDiscussion}
        onBack={() => setSelectedDiscussion(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-400">Discussions</h3>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 text-xs text-primary-light hover:text-primary font-medium transition-colors"
        >
          <HiPlus className="w-3.5 h-3.5" />
          New
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-dark-surface rounded-xl border border-dark-border p-4 space-y-3">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Discussion title"
            className="w-full bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
            autoFocus
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="What do you want to discuss? (optional)"
            rows={3}
            className="w-full bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newTitle.trim() || creating}
              className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {loading && discussions.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : discussions.length > 0 ? (
        <div className="space-y-3">
          {discussions.map((discussion, index) => (
            <div key={discussion.id} ref={index === discussions.length - 1 ? lastRef : null}>
              <div className="relative">
                <DiscussionThread
                  discussion={discussion}
                  onDelete={handleDelete}
                  onSelect={setSelectedDiscussion}
                />
                {discussion.userId === user?.id && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(discussion.id); }}
                    className="absolute top-3 right-3 text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <HiTrash className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <HiChatBubbleLeftRight className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No discussions yet</p>
          <p className="text-gray-600 text-xs">Start a conversation with your generation</p>
        </div>
      )}

      {loading && discussions.length > 0 && (
        <div className="flex justify-center py-2">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default GenerationDiscussions;

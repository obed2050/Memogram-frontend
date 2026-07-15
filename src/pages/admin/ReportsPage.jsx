import { useState, useEffect } from 'react';
import { HiOutlineFlag, HiOutlineExclamationTriangle, HiOutlineTrash, HiOutlineEyeSlash } from 'react-icons/hi2';
import Avatar from '../../components/ui/Avatar';
import { adminService } from '../../services';
import { formatDate } from '../../utils';
import toast from 'react-hot-toast';

const ReportsPage = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null);
  const [actionReason, setActionReason] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminService.getReports();
        setReports(res.data);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleDeletePost = async () => {
    if (!actionModal) return;
    try {
      await adminService.modDeletePost(actionModal.id, actionReason);
      setReports((prev) => ({
        lowEngagement: prev.lowEngagement.filter((p) => p.id !== actionModal.id),
        emptyPosts: prev.emptyPosts.filter((p) => p.id !== actionModal.id),
      }));
      toast.success('Post deleted and logged');
      setActionModal(null);
      setActionReason('');
    } catch { toast.error('Failed to delete post'); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderPostRow = (post) => (
    <div key={post.id} className="flex items-center gap-3 p-3 rounded-xl bg-dark-surface border border-dark-border">
      <Avatar src={post.author?.profilePhoto} name={post.author?.fullName} size="xs" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-300 truncate">{post.content || '(no content)'}</p>
        <p className="text-[10px] text-gray-500 mt-0.5">@{post.author?.username} · {formatDate(post.createdAt)}</p>
      </div>
      <div className="flex gap-2 text-[10px] text-gray-500">
        <span>{post.likesCount} likes</span>
        <span>{post.commentsCount} comments</span>
      </div>
      <button
        onClick={() => setActionModal(post)}
        className="p-1.5 rounded-lg hover:bg-dark-card text-gray-500 hover:text-red-400 transition-colors"
        title="Delete"
      >
        <HiOutlineTrash className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Flagged and low-quality content</p>
      </div>

      <div className="bg-dark-card rounded-2xl border border-dark-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <HiOutlineExclamationTriangle className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-semibold text-gray-400">Low Engagement Posts</h3>
          <span className="text-[10px] text-gray-600 ml-auto">{reports?.lowEngagement?.length || 0}</span>
        </div>
        <div className="space-y-2">
          {reports?.lowEngagement?.length > 0 ? reports.lowEngagement.map(renderPostRow) : (
            <p className="text-center text-gray-500 text-sm py-4">No low engagement posts</p>
          )}
        </div>
      </div>

      <div className="bg-dark-card rounded-2xl border border-dark-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <HiOutlineFlag className="w-5 h-5 text-rose-400" />
          <h3 className="text-sm font-semibold text-gray-400">Empty Posts</h3>
          <span className="text-[10px] text-gray-600 ml-auto">{reports?.emptyPosts?.length || 0}</span>
        </div>
        <div className="space-y-2">
          {reports?.emptyPosts?.length > 0 ? reports.emptyPosts.map(renderPostRow) : (
            <p className="text-center text-gray-500 text-sm py-4">No empty posts</p>
          )}
        </div>
      </div>

      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Delete Post</h3>
            <p className="text-sm text-gray-400 mb-4">
              Delete post by <span className="text-white font-medium">@{actionModal.author?.username}</span>
            </p>

            <div className="p-3 rounded-xl bg-dark-surface border border-dark-border mb-4">
              <p className="text-sm text-gray-300 truncate">{actionModal.content || '(no content)'}</p>
            </div>

            <label className="block text-xs text-gray-500 mb-1.5">Reason (optional)</label>
            <textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              rows={3}
              placeholder="Reason for deletion..."
              className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setActionModal(null); setActionReason(''); }}
                className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-dark-surface transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;

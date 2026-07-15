import { useState, useEffect, useCallback } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineTrash, HiOutlineEyeSlash, HiOutlineEye } from 'react-icons/hi2';
import DataTable from '../../components/admin/DataTable';
import Avatar from '../../components/ui/Avatar';
import { adminService } from '../../services';
import { formatDate } from '../../utils';
import toast from 'react-hot-toast';

const CommentsPage = () => {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [hideModal, setHideModal] = useState(null);
  const [hideReason, setHideReason] = useState('');

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getComments({ page, limit: 20, search });
      setComments(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch {} finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleHide = async () => {
    if (!hideModal) return;
    try {
      await adminService.hideComment(hideModal.id, hideReason);
      setComments((prev) => prev.map((c) => c.id === hideModal.id ? { ...c, hidden: true } : c));
      toast.success('Comment hidden');
      setHideModal(null);
      setHideReason('');
    } catch { toast.error('Failed to hide comment'); }
  };

  const handleUnhide = async (commentId) => {
    try {
      await adminService.unhideComment(commentId);
      setComments((prev) => prev.map((c) => c.id === commentId ? { ...c, hidden: false } : c));
      toast.success('Comment unhidden');
    } catch { toast.error('Failed to unhide comment'); }
  };

  const handleDelete = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await adminService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success('Comment deleted');
    } catch { toast.error('Failed to delete comment'); }
  };

  const columns = [
    {
      header: 'Author',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Avatar src={row.author?.profilePhoto} name={row.author?.fullName} size="xs" />
          <span className="text-xs text-gray-300">{row.author?.fullName}</span>
        </div>
      ),
    },
    {
      header: 'Comment',
      render: (row) => (
        <div className="flex items-center gap-2">
          <p className={`text-xs max-w-[250px] truncate ${row.hidden ? 'text-gray-600 line-through' : 'text-gray-400'}`}>
            {row.content}
          </p>
          {row.hidden && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20">
              HIDDEN
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'On Post',
      render: (row) => <p className="text-xs text-gray-500 max-w-[150px] truncate">{row.post?.content || '(deleted)'}</p>,
    },
    { header: 'Date', render: (row) => <span className="text-xs text-gray-500">{formatDate(row.createdAt)}</span> },
    {
      header: '',
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.hidden ? (
            <button
              onClick={() => handleUnhide(row.id)}
              className="p-1.5 rounded-lg hover:bg-green-500/10 text-gray-500 hover:text-green-400 transition-colors"
              title="Unhide"
            >
              <HiOutlineEye className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setHideModal(row)}
              className="p-1.5 rounded-lg hover:bg-amber-500/10 text-gray-500 hover:text-amber-400 transition-colors"
              title="Hide"
            >
              <HiOutlineEyeSlash className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => handleDelete(row.id)} className="p-1.5 rounded-lg hover:bg-dark-surface text-gray-500 hover:text-red-400 transition-colors">
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Comments</h1>
          <p className="text-sm text-gray-500 mt-1">Moderate all comments</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search comments..."
              className="pl-9 pr-4 py-2 bg-dark-surface border border-dark-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary w-64"
            />
          </div>
        </form>
      </div>
      <DataTable columns={columns} data={comments} page={page} totalPages={totalPages} onPageChange={setPage} loading={loading} emptyMessage="No comments found" />

      {hideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Hide Comment</h3>
            <p className="text-sm text-gray-400 mb-4">
              Hide comment by <span className="text-white font-medium">{hideModal.author?.fullName}</span>
            </p>

            <div className="p-3 rounded-xl bg-dark-surface border border-dark-border mb-4">
              <p className="text-sm text-gray-300">{hideModal.content}</p>
            </div>

            <label className="block text-xs text-gray-500 mb-1.5">Reason (optional)</label>
            <textarea
              value={hideReason}
              onChange={(e) => setHideReason(e.target.value)}
              rows={3}
              placeholder="Reason for hiding..."
              className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setHideModal(null); setHideReason(''); }}
                className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-dark-surface transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleHide}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-amber-500/15 text-amber-400 border border-amber-500/20 hover:bg-amber-500/25 transition-all"
              >
                Hide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsPage;

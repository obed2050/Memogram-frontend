import { useState, useEffect, useCallback } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineTrash } from 'react-icons/hi2';
import DataTable from '../../components/admin/DataTable';
import Avatar from '../../components/ui/Avatar';
import { adminService } from '../../services';
import { formatDate } from '../../utils';
import toast from 'react-hot-toast';

const TYPE_FILTERS = ['all', 'post', 'memory', 'reel'];

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getPosts({ page, limit: 20, type, search });
      setPosts(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch {} finally {
      setLoading(false);
    }
  }, [page, type, search]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await adminService.modDeletePost(deleteModal.id, deleteReason);
      setPosts((prev) => prev.filter((p) => p.id !== deleteModal.id));
      toast.success('Post deleted and logged');
      setDeleteModal(null);
      setDeleteReason('');
    } catch { toast.error('Failed to delete post'); }
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
      header: 'Content',
      render: (row) => (
        <p className="text-xs text-gray-400 max-w-[200px] truncate">{row.content || '(no text)'}</p>
      ),
    },
    {
      header: 'Type',
      render: (row) => {
        const colors = { post: 'bg-blue-500/15 text-blue-400', memory: 'bg-amber-500/15 text-amber-400', reel: 'bg-rose-500/15 text-rose-400' };
        return <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${colors[row.type] || ''}`}>{row.type}</span>;
      },
    },
    { header: 'Likes', render: (row) => <span className="text-xs text-gray-400">{row.likesCount}</span> },
    { header: 'Comments', render: (row) => <span className="text-xs text-gray-400">{row.commentsCount}</span> },
    { header: 'Date', render: (row) => <span className="text-xs text-gray-500">{formatDate(row.createdAt)}</span> },
    {
      header: '',
      render: (row) => (
        <button onClick={() => setDeleteModal(row)} className="p-1.5 rounded-lg hover:bg-dark-surface text-gray-500 hover:text-red-400 transition-colors">
          <HiOutlineTrash className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Posts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all platform content</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search content..."
              className="pl-9 pr-4 py-2 bg-dark-surface border border-dark-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary w-64"
            />
          </div>
        </form>
      </div>

      <div className="flex gap-1 bg-dark-card border border-dark-border rounded-xl p-1 w-fit">
        {TYPE_FILTERS.map((t) => (
          <button
            key={t}
            onClick={() => { setType(t); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              type === t ? 'bg-primary/15 text-primary-light' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={posts} page={page} totalPages={totalPages} onPageChange={setPage} loading={loading} emptyMessage="No posts found" />

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Delete Post</h3>
            <p className="text-sm text-gray-400 mb-4">
              Delete post by <span className="text-white font-medium">{deleteModal.author?.fullName}</span>
            </p>

            <div className="p-3 rounded-xl bg-dark-surface border border-dark-border mb-4">
              <p className="text-sm text-gray-300 truncate">{deleteModal.content || '(no content)'}</p>
            </div>

            <label className="block text-xs text-gray-500 mb-1.5">Reason (optional)</label>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              rows={3}
              placeholder="Reason for deletion..."
              className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setDeleteModal(null); setDeleteReason(''); }}
                className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-dark-surface transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
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

export default PostsPage;

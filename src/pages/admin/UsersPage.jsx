import { useState, useEffect, useCallback } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineTrash, HiOutlineNoSymbol, HiOutlineCheckCircle } from 'react-icons/hi2';
import DataTable from '../../components/admin/DataTable';
import Avatar from '../../components/ui/Avatar';
import { adminService } from '../../services';
import { formatDate } from '../../utils';
import toast from 'react-hot-toast';

const SUSPEND_OPTIONS = [
  { value: '1h', label: '1 Hour' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: 'permanent', label: 'Permanent' },
];

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [suspendModal, setSuspendModal] = useState(null);
  const [suspendDuration, setSuspendDuration] = useState('24h');
  const [suspendReason, setSuspendReason] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({ page, limit: 20, search });
      setUsers(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch {} finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`User ${newRole === 'admin' ? 'promoted to' : 'demoted from'} admin`);
    } catch { toast.error('Failed to update role'); }
  };

  const handleSuspend = async () => {
    if (!suspendModal) return;
    try {
      await adminService.suspendUser(suspendModal.id, suspendDuration, suspendReason);
      setUsers((prev) => prev.map((u) => u.id === suspendModal.id
        ? { ...u, suspended: true, suspendedUntil: new Date(Date.now() + ({ '1h': 3600000, '24h': 86400000, '7d': 604800000, '30d': 2592000000, 'permanent': 31536000000 }[suspendDuration])), suspensionReason: suspendReason }
        : u));
      toast.success('User suspended');
      setSuspendModal(null);
      setSuspendReason('');
    } catch { toast.error('Failed to suspend user'); }
  };

  const handleUnsuspend = async (userId) => {
    try {
      await adminService.unsuspendUser(userId);
      setUsers((prev) => prev.map((u) => u.id === userId
        ? { ...u, suspended: false, suspendedUntil: null, suspensionReason: null }
        : u));
      toast.success('User unsuspended');
    } catch { toast.error('Failed to unsuspend user'); }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await adminService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
  };

  const columns = [
    {
      header: 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.profilePhoto} name={row.fullName} size="sm" />
          <div>
            <p className="text-sm font-medium text-white">{row.fullName}</p>
            <p className="text-xs text-gray-500">@{row.username}</p>
          </div>
        </div>
      ),
    },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Role',
      render: (row) => (
        <button
          onClick={() => handleRoleToggle(row.id, row.role)}
          className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
            row.role === 'admin'
              ? 'bg-primary/15 text-primary-light border border-primary/20 hover:bg-primary/25'
              : 'bg-dark-surface text-gray-400 border border-dark-border hover:bg-dark-hover'
          }`}
        >
          {row.role === 'admin' ? 'Admin' : 'User'}
        </button>
      ),
    },
    {
      header: 'Status',
      render: (row) => {
        if (row.suspended) {
          const isExpired = row.suspendedUntil && new Date(row.suspendedUntil) <= new Date();
          if (isExpired) return <span className="text-[10px] text-gray-500">Expired</span>;
          return (
            <span className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/20">
              Suspended
            </span>
          );
        }
        return <span className="text-[10px] text-green-400">Active</span>;
      },
    },
    {
      header: 'Joined',
      render: (row) => <span className="text-xs text-gray-500">{formatDate(row.createdAt)}</span>,
    },
    {
      header: '',
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.suspended ? (
            <button
              onClick={() => handleUnsuspend(row.id)}
              className="p-1.5 rounded-lg hover:bg-green-500/10 text-gray-500 hover:text-green-400 transition-colors"
              title="Unsuspend"
            >
              <HiOutlineCheckCircle className="w-4 h-4" />
            </button>
          ) : row.role !== 'admin' ? (
            <button
              onClick={() => setSuspendModal(row)}
              className="p-1.5 rounded-lg hover:bg-amber-500/10 text-gray-500 hover:text-amber-400 transition-colors"
              title="Suspend"
            >
              <HiOutlineNoSymbol className="w-4 h-4" />
            </button>
          ) : null}
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
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} users loaded</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search users..."
              className="pl-9 pr-4 py-2 bg-dark-surface border border-dark-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary w-64"
            />
          </div>
        </form>
      </div>
      <DataTable columns={columns} data={users} page={page} totalPages={totalPages} onPageChange={setPage} loading={loading} emptyMessage="No users found" />

      {suspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Suspend User</h3>
            <p className="text-sm text-gray-400 mb-4">
              Suspend <span className="text-white font-medium">{suspendModal.fullName}</span> (@{suspendModal.username})
            </p>

            <label className="block text-xs text-gray-500 mb-1.5">Duration</label>
            <div className="flex gap-2 mb-4">
              {SUSPEND_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSuspendDuration(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    suspendDuration === opt.value
                      ? 'bg-primary/15 text-primary-light border border-primary/20'
                      : 'bg-dark-surface text-gray-400 border border-dark-border hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <label className="block text-xs text-gray-500 mb-1.5">Reason (optional)</label>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              rows={3}
              placeholder="Reason for suspension..."
              className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setSuspendModal(null); setSuspendReason(''); }}
                className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-dark-surface transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-amber-500/15 text-amber-400 border border-amber-500/20 hover:bg-amber-500/25 transition-all"
              >
                Suspend
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;

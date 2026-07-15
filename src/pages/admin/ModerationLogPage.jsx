import { useState, useEffect, useCallback } from 'react';
import { HiOutlineShieldCheck, HiOutlineUserCircle, HiOutlineDocumentText, HiOutlineChatBubbleLeftRight, HiOutlineCalendarDays, HiOutlineNoSymbol, HiOutlineEyeSlash, HiOutlineArrowPath } from 'react-icons/hi2';
import Avatar from '../../components/ui/Avatar';
import DataTable from '../../components/admin/DataTable';
import { adminService } from '../../services';
import { formatDate } from '../../utils';

const ACTION_META = {
  delete_post: { label: 'Deleted Post', icon: HiOutlineDocumentText, color: 'text-red-400', bg: 'bg-red-500/10' },
  delete_comment: { label: 'Deleted Comment', icon: HiOutlineChatBubbleLeftRight, color: 'text-red-400', bg: 'bg-red-500/10' },
  hide_comment: { label: 'Hidden Comment', icon: HiOutlineEyeSlash, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  suspend_user: { label: 'Suspended User', icon: HiOutlineNoSymbol, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  unsuspend_user: { label: 'Unsuspended User', icon: HiOutlineArrowPath, color: 'text-green-400', bg: 'bg-green-500/10' },
  update_role: { label: 'Changed Role', icon: HiOutlineUserCircle, color: 'text-primary-light', bg: 'bg-primary/10' },
  delete_user: { label: 'Deleted User', icon: HiOutlineUserCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  delete_event: { label: 'Deleted Event', icon: HiOutlineCalendarDays, color: 'text-red-400', bg: 'bg-red-500/10' },
};

const FILTER_OPTIONS = ['', 'delete_post', 'delete_comment', 'hide_comment', 'suspend_user', 'unsuspend_user', 'update_role', 'delete_user', 'delete_event'];

const ModerationLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const [logsRes, statsRes] = await Promise.all([
        adminService.getModLogs({ page, limit: 20, action: filter }),
        adminService.getModStats(),
      ]);
      setLogs(logsRes.data.data);
      setTotalPages(logsRes.data.totalPages);
      setStats(statsRes.data);
    } catch {} finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const describeLog = (log) => {
    const meta = ACTION_META[log.action] || { label: log.action, icon: HiOutlineShieldCheck, color: 'text-gray-400', bg: 'bg-gray-500/10' };
    const parts = [];

    if (log.targetUser) {
      parts.push(<span key="t" className="text-white font-medium">{log.targetUser.fullName}</span>);
    }

    if (log.meta?.duration) {
      parts.push(<span key="d" className="text-gray-500">({log.meta.duration})</span>);
    }
    if (log.meta?.newRole) {
      parts.push(<span key="r" className="text-primary-light">→ {log.meta.newRole}</span>);
    }
    if (log.meta?.postType) {
      parts.push(<span key="pt" className="text-gray-500">({log.meta.postType})</span>);
    }

    return { ...meta, parts };
  };

  const columns = [
    {
      header: 'Action',
      render: (row) => {
        const info = describeLog(row);
        const Icon = info.icon;
        return (
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg ${info.bg} flex items-center justify-center`}>
              <Icon className={`w-3.5 h-3.5 ${info.color}`} />
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className={info.color}>{info.label}</span>
              {info.parts}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Admin',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Avatar src={row.admin?.profilePhoto} name={row.admin?.fullName} size="xs" />
          <span className="text-xs text-gray-300">{row.admin?.fullName}</span>
        </div>
      ),
    },
    {
      header: 'Reason',
      render: (row) => (
        <p className="text-xs text-gray-500 max-w-[180px] truncate">{row.reason || '—'}</p>
      ),
    },
    {
      header: 'When',
      render: (row) => <span className="text-xs text-gray-500">{formatDate(row.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Moderation Log</h1>
        <p className="text-sm text-gray-500 mt-1">All admin moderation actions</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total Actions', value: stats.total, color: 'text-white' },
            { label: 'Last 7 Days', value: stats.last7d, color: 'text-primary-light' },
            { label: 'Last 30 Days', value: stats.last30d, color: 'text-primary-light' },
            { label: 'Suspended Users', value: stats.suspendedUsers, color: 'text-amber-400' },
            { label: 'Hidden Comments', value: stats.hiddenComments, color: 'text-amber-400' },
          ].map((s) => (
            <div key={s.label} className="bg-dark-card border border-dark-border rounded-xl p-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
              <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1 bg-dark-card border border-dark-border rounded-xl p-1 w-fit">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f ? 'bg-primary/15 text-primary-light' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {f ? ACTION_META[f]?.label || f : 'All'}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={logs} page={page} totalPages={totalPages} onPageChange={setPage} loading={loading} emptyMessage="No moderation logs" />
    </div>
  );
};

export default ModerationLogPage;

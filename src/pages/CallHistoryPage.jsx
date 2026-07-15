import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiPhoneArrowUpRight, HiPhoneArrowDownLeft, HiPhoneXMark,
  HiVideoCamera, HiPhone, HiClock, HiCalendarDays,
} from 'react-icons/hi2';
import { useAuth } from '../contexts/AuthContext';
import { callService } from '../services';
import Avatar from '../components/ui/Avatar';
import { cn } from '../utils';
import toast from 'react-hot-toast';

const formatDuration = (sec) => {
  if (!sec) return '0:00';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
};

const CallHistoryPage = () => {
  const { user } = useAuth();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, voice, video, missed

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const res = await callService.getCallHistory({ page: 1, limit: 50 });
      setCalls(res.data.data || res.data.calls || []);
    } catch {
      toast.error('Failed to load call history');
    } finally {
      setLoading(false);
    }
  };

  const filtered = calls.filter((c) => {
    if (filter === 'missed') return c.status === 'missed';
    if (filter === 'voice') return c.callType === 'voice';
    if (filter === 'video') return c.callType === 'video';
    return true;
  });

  const getCallIcon = (call) => {
    const isMissed = call.status === 'missed';
    const isOutgoing = call.callerId === user?.id;

    if (isMissed) return <HiPhoneXMark className="w-5 h-5 text-red-400" />;
    if (call.callType === 'video') return <HiVideoCamera className="w-5 h-5 text-primary" />;
    if (isOutgoing) return <HiPhoneArrowUpRight className="w-5 h-5 text-green-400" />;
    return <HiPhoneArrowDownLeft className="w-5 h-5 text-green-400" />;
  };

  const getStatusLabel = (call) => {
    const isOutgoing = call.callerId === user?.id;
    const prefix = isOutgoing ? 'Outgoing' : 'Incoming';
    if (call.status === 'missed') return 'Missed';
    return prefix;
  };

  const filters = [
    { key: 'all', label: 'All Calls' },
    { key: 'voice', label: 'Voice' },
    { key: 'video', label: 'Video' },
    { key: 'missed', label: 'Missed' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Call History</h1>
        <p className="text-sm text-gray-500">Your recent voice and video calls</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer',
              filter === key
                ? 'bg-primary text-dark font-semibold'
                : 'bg-dark-surface text-gray-400 hover:text-white border border-dark-border'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Call List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-dark-card border border-dark-border">
              <div className="skeleton w-12 h-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-32 rounded" />
                <div className="skeleton h-3 w-20 rounded" />
              </div>
              <div className="skeleton h-8 w-8 rounded-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-dark-surface flex items-center justify-center mx-auto mb-4">
            <HiPhone className="w-10 h-10 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">No calls yet</h3>
          <p className="text-sm text-gray-500">Your call history will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((call, i) => {
            const otherUser = call.caller?.id === user?.id ? call.receiver : call.caller;
            const isMissed = call.status === 'missed';

            return (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-2xl border transition-colors',
                  isMissed
                    ? 'bg-red-500/5 border-red-500/10'
                    : 'bg-dark-card border-dark-border hover:bg-dark-surface/50'
                )}
              >
                <div className="relative shrink-0">
                  <Avatar src={otherUser?.profilePhoto} name={otherUser?.fullName} size="md" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-dark-card border border-dark-border flex items-center justify-center">
                    {getCallIcon(call)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      'text-sm font-semibold truncate',
                      isMissed ? 'text-red-400' : 'text-white'
                    )}>
                      {otherUser?.fullName || 'Unknown'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn(
                      'text-xs',
                      isMissed ? 'text-red-400/70' : 'text-gray-500'
                    )}>
                      {getStatusLabel(call)}
                    </span>
                    <span className="text-gray-600">·</span>
                    <span className="text-xs text-gray-500">
                      {call.duration ? formatDuration(call.duration) : ''}
                    </span>
                    <span className="text-gray-600">·</span>
                    <span className="text-xs text-gray-500">
                      {formatDate(call.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {call.callType === 'video' ? (
                    <HiVideoCamera className="w-5 h-5 text-gray-500" />
                  ) : (
                    <HiPhone className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CallHistoryPage;

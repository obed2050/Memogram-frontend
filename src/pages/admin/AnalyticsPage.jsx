import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area,
} from 'recharts';
import {
  HiOutlineUsers, HiOutlineUserGroup, HiOutlineUser,
  HiOutlineEye, HiOutlineArrowTrendingUp, HiOutlinePlay,
  HiOutlineFilm, HiOutlineHeart, HiOutlineChatBubbleLeftRight,
  HiOutlineBuildingLibrary, HiOutlineClock,
} from 'react-icons/hi2';
import Avatar from '../../components/ui/Avatar';
import { analyticsService } from '../../services';

const COLORS = {
  primary: '#F4C542',
  accent: '#6C3CF0',
  success: '#10B981',
  danger: '#EF4444',
  cyan: '#06B6D4',
  pink: '#EC4899',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl px-3 py-2 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-medium" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="bg-dark-card rounded-2xl border border-dark-border p-4 flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
      <Icon className="w-6 h-6" style={{ color }} />
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-xs text-gray-500">{label}</p>
      {sub && <p className="text-[10px] text-gray-600 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const AnalyticsPage = () => {
  const [overview, setOverview] = useState(null);
  const [dailyUsers, setDailyUsers] = useState([]);
  const [monthlyUsers, setMonthlyUsers] = useState([]);
  const [sessions, setSessions] = useState(null);
  const [popularReels, setPopularReels] = useState([]);
  const [popularMemories, setPopularMemories] = useState([]);
  const [communityGrowth, setCommunityGrowth] = useState([]);
  const [growthTotals, setGrowthTotals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const load = async () => {
      try {
        const [ov, du, mu, sess, reels, mems, cg] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getDailyUsers(days),
          analyticsService.getMonthlyUsers(12),
          analyticsService.getActiveSessions(),
          analyticsService.getPopularReels({ limit: 8, days }),
          analyticsService.getPopularMemories({ limit: 8, days }),
          analyticsService.getCommunityGrowth(12),
        ]);
        setOverview(ov.data.data);
        setDailyUsers(du.data.data);
        setMonthlyUsers(mu.data.data);
        setSessions(sess.data.data);
        setPopularReels(reels.data.data);
        setPopularMemories(mems.data.data);
        setCommunityGrowth(cg.data.data);
        setGrowthTotals(cg.data.totals);
      } catch {} finally {
        setLoading(false);
      }
    };
    load();
  }, [days]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Platform performance & growth metrics</p>
        </div>
        <select
          value={days}
          onChange={(e) => { setDays(parseInt(e.target.value)); setLoading(true); }}
          className="bg-dark-surface border border-dark-border rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-primary"
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard icon={HiOutlineUser} label="Daily Active" value={overview?.dau || 0} color={COLORS.primary} />
        <StatCard icon={HiOutlineUserGroup} label="Weekly Active" value={overview?.wau || 0} color={COLORS.cyan} />
        <StatCard icon={HiOutlineUsers} label="Monthly Active" value={overview?.mau || 0} color={COLORS.success} />
        <StatCard icon={HiOutlineEye} label="Online Now" value={overview?.onlineNow || 0} color={COLORS.accent} sub="Live count" />
        <StatCard icon={HiOutlineUsers} label="Total Users" value={overview?.totalUsers || 0} color={COLORS.pink} />
      </div>

      {/* Daily Users Chart */}
      <div className="bg-dark-card rounded-2xl border border-dark-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <HiOutlineArrowTrendingUp className="w-5 h-5 text-primary-light" />
          <h3 className="text-sm font-semibold text-gray-400">Daily Active Users</h3>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyUsers}>
              <defs>
                <linearGradient id="gradDAU" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#232328" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="users" name="Active Users" stroke={COLORS.primary} fill="url(#gradDAU)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Users */}
        <div className="bg-dark-card rounded-2xl border border-dark-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineUsers className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-semibold text-gray-400">Monthly Active Users</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyUsers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232328" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="users" name="Unique Users" fill={COLORS.cyan} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Sessions Card */}
        <div className="bg-dark-card rounded-2xl border border-dark-border p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineClock className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-semibold text-gray-400">Active Sessions</h3>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-dark-border" />
                <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-bold text-white">{sessions?.onlineCount || 0}</span>
                  <span className="text-xs text-gray-500">online</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="bg-dark-surface rounded-xl p-2">
                  <p className="text-lg font-bold text-primary-light">{sessions?.weeklyActiveUsers || 0}</p>
                  <p className="text-[10px] text-gray-500">7-Day Active</p>
                </div>
                <div className="bg-dark-surface rounded-xl p-2">
                  <p className="text-lg font-bold text-amber-400">{sessions?.onlineUserIds?.length || 0}</p>
                  <p className="text-[10px] text-gray-500">Tracked IDs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Reels */}
      <div className="bg-dark-card rounded-2xl border border-dark-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <HiOutlineFilm className="w-5 h-5 text-pink-400" />
          <h3 className="text-sm font-semibold text-gray-400">Popular Reels</h3>
          <span className="text-[10px] text-gray-600 ml-auto">Last {days} days</span>
        </div>
        {popularReels.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-8">No reels posted in this period</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {popularReels.map((reel, i) => (
              <div key={reel.id} className="bg-dark-surface rounded-xl border border-dark-border overflow-hidden group">
                <div className="relative aspect-[9/16] bg-dark-bg">
                  {reel.thumbnail ? (
                    <img src={reel.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <HiOutlinePlay className="w-10 h-10 text-gray-700" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
                    <HiOutlinePlay className="w-3 h-3 text-white" />
                    <span className="text-[10px] font-bold text-white">#{i + 1}</span>
                  </div>
                </div>
                <div className="p-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Avatar src={reel.author?.profilePhoto} name={reel.author?.fullName} size="xs" />
                    <span className="text-[10px] text-gray-400 truncate">{reel.author?.fullName}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 line-clamp-2">{reel.content || 'No caption'}</p>
                  <div className="flex gap-3 mt-1.5">
                    <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                      <HiOutlineHeart className="w-3 h-3" /> {reel.likesCount}
                    </span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                      <HiOutlineChatBubbleLeftRight className="w-3 h-3" /> {reel.commentsCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popular Memories */}
      <div className="bg-dark-card rounded-2xl border border-dark-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <HiOutlineHeart className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-semibold text-gray-400">Popular Memories</h3>
          <span className="text-[10px] text-gray-600 ml-auto">Last {days} days</span>
        </div>
        {popularMemories.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-8">No memories posted in this period</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {popularMemories.map((mem, i) => (
              <div key={mem.id} className="bg-dark-surface rounded-xl border border-dark-border overflow-hidden">
                <div className="relative aspect-square bg-dark-bg">
                  {mem.thumbnail ? (
                    <img src={mem.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                      <HiOutlineHeart className="w-10 h-10 text-gray-700" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
                    <HiOutlineHeart className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-bold text-white">#{i + 1}</span>
                  </div>
                </div>
                <div className="p-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Avatar src={mem.author?.profilePhoto} name={mem.author?.fullName} size="xs" />
                    <span className="text-[10px] text-gray-400 truncate">{mem.author?.fullName}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 line-clamp-2">{mem.caption || 'No caption'}</p>
                  <div className="flex gap-3 mt-1.5">
                    <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                      <HiOutlineHeart className="w-3 h-3" /> {mem.likesCount}
                    </span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                      <HiOutlineChatBubbleLeftRight className="w-3 h-3" /> {mem.commentsCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Community Growth */}
      <div className="bg-dark-card rounded-2xl border border-dark-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HiOutlineBuildingLibrary className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold text-gray-400">Community Growth</h3>
          </div>
          {growthTotals && (
            <div className="flex gap-4 text-xs text-gray-500">
              <span>School Members: <span className="text-white font-medium">{growthTotals.schoolMembers.toLocaleString()}</span></span>
              <span>Club Members: <span className="text-white font-medium">{growthTotals.clubMembers.toLocaleString()}</span></span>
            </div>
          )}
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={communityGrowth}>
              <defs>
                <linearGradient id="gradSchool" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradClub" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#232328" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cumulativeSchool" name="School Members" stroke={COLORS.success} fill="url(#gradSchool)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="cumulativeClub" name="Club Members" stroke={COLORS.accent} fill="url(#gradClub)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.success }} />
            <span className="text-xs text-gray-400">School Members (cumulative)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.accent }} />
            <span className="text-xs text-gray-400">Club Members (cumulative)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

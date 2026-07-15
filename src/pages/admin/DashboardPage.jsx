import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import {
  HiOutlineUserGroup, HiOutlineDocumentText, HiOutlineCalendarDays,
  HiOutlineChatBubbleLeftRight, HiOutlineBuildingLibrary, HiOutlineFilm,
  HiOutlinePhoto, HiOutlineFlag,
} from 'react-icons/hi2';
import StatCard from '../../components/admin/StatCard';
import { adminService } from '../../services';

const CHART_COLORS = ['#F4C542', '#6C3CF0', '#10B981', '#EF4444', '#06B6D4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl px-3 py-2 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-medium" style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [userGrowth, setUserGrowth] = useState([]);
  const [contentData, setContentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, growthRes, contentRes] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getUserGrowth(30),
          adminService.getContentAnalytics(30),
        ]);
        setStats(statsRes.data.stats);
        setUserGrowth(growthRes.data.data);
        setContentData(contentRes.data.data);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pieData = stats ? [
    { name: 'Posts', value: stats.totalPosts },
    { name: 'Memories', value: stats.totalMemories },
    { name: 'Reels', value: stats.totalReels },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Platform overview and analytics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Users" value={stats?.totalUsers} icon={HiOutlineUserGroup} color="primary" change={stats?.newUsers30d > 0 ? 12 : 0} changeLabel="this month" delay={0} />
        <StatCard title="Posts" value={stats?.totalPosts} icon={HiOutlineDocumentText} color="emerald" delay={1} />
        <StatCard title="Memories" value={stats?.totalMemories} icon={HiOutlinePhoto} color="amber" delay={2} />
        <StatCard title="Reels" value={stats?.totalReels} icon={HiOutlineFilm} color="rose" delay={3} />
        <StatCard title="Comments" value={stats?.totalComments} icon={HiOutlineChatBubbleLeftRight} color="cyan" delay={4} />
        <StatCard title="Communities" value={stats?.totalCommunities} icon={HiOutlineBuildingLibrary} color="purple" delay={5} />
        <StatCard title="Events" value={stats?.totalEvents} icon={HiOutlineCalendarDays} color="accent" delay={6} />
        <StatCard title="New Users (7d)" value={stats?.newUsers7d} icon={HiOutlineUserGroup} color="emerald" delay={7} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* User Growth Chart */}
        <div className="lg:col-span-2 bg-dark-card rounded-2xl border border-dark-border p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">User Growth (30 days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowth}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F4C542" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F4C542" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#232328" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="New Users" stroke="#F4C542" fill="url(#colorUsers)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Distribution */}
        <div className="bg-dark-card rounded-2xl border border-dark-border p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">Content Split</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i] }} />
                <span className="text-[10px] text-gray-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Activity Chart */}
      <div className="bg-dark-card rounded-2xl border border-dark-border p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-4">Content Activity (30 days)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={contentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#232328" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="posts" name="Posts" fill="#F4C542" radius={[2, 2, 0, 0]} />
              <Bar dataKey="memories" name="Memories" fill="#6C3CF0" radius={[2, 2, 0, 0]} />
              <Bar dataKey="reels" name="Reels" fill="#EF4444" radius={[2, 2, 0, 0]} />
              <Bar dataKey="comments" name="Comments" fill="#06B6D4" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

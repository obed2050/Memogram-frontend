import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiClock, HiUserGroup, HiFilm, HiEllipsisVertical, HiPlay } from 'react-icons/hi2';
import { onThisDayService, communityService, exploreService } from '../../services';
import { formatNumber } from '../../utils';

const RightSidebar = () => {
  const [onThisDay, setOnThisDay] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [otdRes, commRes, exploreRes] = await Promise.allSettled([
          onThisDayService.getMemories(),
          communityService.getMyCommunities(),
          exploreService.getExplore(),
        ]);

        if (otdRes.status === 'fulfilled' && otdRes.value?.data?.data) {
          setOnThisDay(otdRes.value.data.data);
        }
        if (commRes.status === 'fulfilled') {
          const schools = commRes.value?.data?.communities || [];
          setCommunities(schools.filter((c) => c.isMember).slice(0, 4));
        }
        if (exploreRes.status === 'fulfilled') {
          setTrending(exploreRes.value?.data?.trendingReels?.slice(0, 3) || []);
        }
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <aside className="w-[300px] shrink-0 h-full border-l border-dark-border bg-dark-card/20">
      <div className="sidebar-scroll p-4 space-y-5">
        {/* On This Day */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card-solid overflow-hidden"
        >
          <div className="relative p-5 bg-gradient-to-br from-primary/15 via-dark-card to-accent/10">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-6 translate-x-6" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <HiClock className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-semibold text-primary-light uppercase tracking-wider">On This Day</span>
              </div>
              <p className="text-xs text-gray-400 mb-1">{dateStr}</p>
              <h4 className="text-white font-semibold text-sm mb-1">
                {onThisDay ? 'Memories from your past' : 'No memories yet'}
              </h4>
              <p className="text-xs text-gray-500 mb-3">
                {onThisDay
                  ? `You have ${Array.isArray(onThisDay) ? onThisDay.length : 0} memories from this day`
                  : 'Start posting to see memories here'
                }
              </p>
              <Link
                to="/on-this-day"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white hover:bg-white/10 transition-all"
              >
                See Memories
              </Link>
            </div>
          </div>
        </motion.div>

        {/* School Communities */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card-solid p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-300">School Communities</h3>
            <Link to="/communities" className="text-[11px] font-medium text-primary-light hover:text-primary transition-colors">
              View All
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="skeleton h-3.5 w-28" />
                    <div className="skeleton h-2.5 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : communities.length > 0 ? (
            <div className="space-y-1">
              {communities.map((school) => (
                <Link
                  key={school.schoolId}
                  to={`/communities/${school.schoolId}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-dark-surface/50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 overflow-hidden">
                    {school.schoolLogo ? (
                      <img src={school.schoolLogo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <HiUserGroup className="w-4 h-4 text-primary-light" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate group-hover:text-primary-light transition-colors">
                      {school.schoolName}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {school.memberCount} members
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-600">Join communities to see them here</p>
          )}
        </motion.div>

        {/* Trending Reels */}
        {trending.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card-solid p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-300">Trending Reels</h3>
              <Link to="/reels" className="text-[11px] font-medium text-primary-light hover:text-primary transition-colors">
                View All
              </Link>
            </div>
            <div className="space-y-2">
              {trending.map((reel) => (
                <Link
                  key={reel.id}
                  to={`/post/${reel.id}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-dark-surface/50 transition-all group"
                >
                  <div className="w-14 h-14 rounded-xl bg-dark-surface overflow-hidden relative shrink-0">
                    {reel.videos?.[0] ? (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <HiPlay className="w-5 h-5 text-white/70" />
                      </div>
                    ) : reel.images?.[0] ? (
                      <img src={reel.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <HiFilm className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate group-hover:text-primary-light transition-colors">
                      {reel.content || 'Untitled Reel'}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <span>{formatNumber(reel.likesCount || 0)} likes</span>
                      <span>&middot;</span>
                      <span>{formatNumber(reel.commentsCount || 0)} comments</span>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-lg text-gray-600 hover:text-gray-400 hover:bg-dark-surface opacity-0 group-hover:opacity-100 transition-all">
                    <HiEllipsisVertical className="w-4 h-4" />
                  </button>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="px-1 pt-1 pb-4">
          <p className="text-[10px] text-gray-700 leading-relaxed">
            Memogram &copy; 2026 &middot; Relive your school memories
          </p>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;

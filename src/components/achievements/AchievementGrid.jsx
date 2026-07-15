import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { HiTrophy } from 'react-icons/hi2';
import AchievementBadge from './AchievementBadge';
import { achievementService } from '../../services';

const CATEGORY_LABELS = {
  content: 'Content & Creation',
  engagement: 'Engagement & Likes',
  social: 'Social & Followers',
  school: 'School & Clubs',
  streak: 'Memory Streaks',
};

const CATEGORY_ICONS = {
  content: '📝',
  engagement: '❤️',
  social: '👥',
  school: '🎓',
  streak: '🔥',
};

const AchievementGrid = ({ userId, compact = false, maxDisplay = null }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = userId
          ? await achievementService.getUserAchievements(userId)
          : await achievementService.getMyAchievements();
        setData(res.data);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-dark-card rounded-2xl border border-dark-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <HiTrophy className="w-4 h-4 text-primary-light animate-pulse" />
          <div className="h-4 w-32 bg-dark-surface rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 bg-dark-surface rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { categories, totalEarned, totalAvailable } = data;

  if (compact) {
    const earned = (data.achievements || []).filter((a) => a.earned).slice(0, maxDisplay || 10);
    if (earned.length === 0) return null;
    return (
      <div ref={ref} className="bg-dark-card rounded-2xl border border-dark-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HiTrophy className="w-4 h-4 text-primary-light" />
            <h3 className="text-sm font-semibold text-gray-400">Achievements</h3>
          </div>
          <span className="text-[10px] text-gray-600">{totalEarned}/{totalAvailable}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {earned.map((a, i) => (
            <AchievementBadge key={a.id} achievement={a} index={i} compact />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="space-y-4">
      {/* Summary bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        className="bg-dark-card rounded-2xl border border-dark-border p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <HiTrophy className="w-4 h-4 text-primary-light" />
            <h3 className="text-sm font-semibold text-gray-400">Achievements</h3>
          </div>
          <span className="text-xs text-gray-500">{totalEarned}/{totalAvailable} earned</span>
        </div>
        <div className="h-2 bg-dark-surface rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: `${totalAvailable > 0 ? (totalEarned / totalAvailable) * 100 : 0}%` } : {}}
            transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          />
        </div>
      </motion.div>

      {/* Categories */}
      {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
        const items = categories[cat];
        if (!items || items.length === 0) return null;
        const earnedInCat = items.filter((a) => a.earned).length;
        return (
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="bg-dark-card rounded-2xl border border-dark-border p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">{CATEGORY_ICONS[cat]}</span>
                <h3 className="text-sm font-semibold text-gray-400">{label}</h3>
              </div>
              <span className="text-[10px] text-gray-600">{earnedInCat}/{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.map((a, i) => (
                <AchievementBadge key={a.id} achievement={a} index={i} />
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AchievementGrid;

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { HiFire, HiTrophy, HiArrowUp } from 'react-icons/hi2';

const ALL_BADGES = [
  { threshold: 3, name: 'Getting Started', icon: '🔥', description: '3-day streak' },
  { threshold: 7, name: 'Week Warrior', icon: '⚔️', description: '7-day streak' },
  { threshold: 14, name: 'Fortnight Fighter', icon: '🛡️', description: '14-day streak' },
  { threshold: 30, name: 'Monthly Master', icon: '👑', description: '30-day streak' },
  { threshold: 60, name: 'Streak Champion', icon: '🏆', description: '60-day streak' },
  { threshold: 100, name: 'Century Club', icon: '💯', description: '100-day streak' },
  { threshold: 365, name: 'Year Legend', icon: '🌟', description: '365-day streak' },
];

const BADGE_BG_ACTIVE = [
  'from-orange-500/20 to-red-500/10 border-orange-500/30',
  'from-amber-500/20 to-yellow-500/10 border-amber-500/30',
  'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
  'from-purple-500/20 to-violet-500/10 border-purple-500/30',
  'from-rose-500/20 to-pink-500/10 border-rose-500/30',
  'from-blue-500/20 to-cyan-500/10 border-blue-500/30',
  'from-yellow-500/20 to-amber-500/10 border-yellow-500/30',
];

const STREAK_COLORS = [
  'from-orange-400 to-red-500',
  'from-orange-500 to-amber-500',
  'from-amber-500 to-yellow-500',
  'from-yellow-400 to-lime-500',
  'from-lime-400 to-green-500',
];

const StreakDisplay = ({ streak }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  if (!streak) return null;

  const { currentStreak = 0, longestStreak = 0, totalMemoriesPosted = 0, streakBadges = [] } = streak;
  const earnedNames = new Set(streakBadges.map((b) => b.name));
  const progressPercent = longestStreak > 0 ? Math.min((currentStreak / longestStreak) * 100, 100) : 0;

  const getStreakColor = (days) => {
    if (days >= 100) return STREAK_COLORS[4];
    if (days >= 60) return STREAK_COLORS[3];
    if (days >= 30) return STREAK_COLORS[2];
    if (days >= 7) return STREAK_COLORS[1];
    return STREAK_COLORS[0];
  };

  const getGlowIntensity = (days) => {
    if (days >= 100) return 'shadow-orange-500/30';
    if (days >= 60) return 'shadow-amber-500/25';
    if (days >= 30) return 'shadow-yellow-500/20';
    if (days >= 7) return 'shadow-orange-500/15';
    return 'shadow-orange-500/10';
  };

  return (
    <div ref={ref} className="space-y-4">
      {/* Main Streak Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getStreakColor(currentStreak)} p-[1px]`}
      >
        <div className="bg-dark-card rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getStreakColor(currentStreak)} flex items-center justify-center shadow-lg ${getGlowIntensity(currentStreak)}`}
            >
              <div className="text-center">
                <HiFire className="w-7 h-7 text-white mx-auto" />
                <span className="text-[10px] text-white/80 font-bold mt-0.5 block">STREAK</span>
              </div>
            </motion.div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-black text-white"
                >
                  {currentStreak}
                </motion.span>
                <span className="text-sm text-gray-400">day{currentStreak !== 1 ? 's' : ''}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Current streak</p>
            </div>
            {currentStreak > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4 }}
                className="text-right"
              >
                <div className="flex items-center gap-1 text-emerald-400">
                  <HiArrowUp className="w-3 h-3" />
                  <span className="text-xs font-semibold">Active</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Streak progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Progress to longest</span>
              <span className="text-[10px] text-gray-400 font-medium">{currentStreak}/{longestStreak}</span>
            </div>
            <div className="h-2 bg-dark-surface rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: `${progressPercent}%` } : {}}
                transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full bg-gradient-to-r ${getStreakColor(currentStreak)}`}
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-dark-border">
            <div className="flex items-center gap-1.5">
              <HiTrophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-gray-400">Best: <span className="text-white font-medium">{longestStreak} days</span></span>
            </div>
            <div className="w-px h-3 bg-dark-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">Total: <span className="text-white font-medium">{totalMemoriesPosted} memories</span></span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Badges Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="bg-dark-card rounded-2xl border border-dark-border p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <HiTrophy className="w-4 h-4 text-primary-light" />
          <h3 className="text-sm font-semibold text-gray-400">Streak Badges</h3>
          <span className="ml-auto text-[10px] text-gray-600">{streakBadges.length}/{ALL_BADGES.length}</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {ALL_BADGES.map((badge, i) => {
            const earned = earnedNames.has(badge.name);
            return (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.4 + i * 0.06, type: 'spring', stiffness: 250 }}
                className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                  earned
                    ? `bg-gradient-to-b ${BADGE_BG_ACTIVE[i]} shadow-md`
                    : 'bg-dark-surface border-dark-border opacity-40'
                }`}
                title={`${badge.name} — ${badge.description}${earned ? ' ✓' : ''}`}
              >
                <span className={`text-xl ${earned ? '' : 'grayscale'}`}>{badge.icon}</span>
                <span className="text-[8px] text-gray-500 text-center leading-tight">{badge.threshold}d</span>
                {earned && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-[7px] text-white font-bold">✓</span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default StreakDisplay;

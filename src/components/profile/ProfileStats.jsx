import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  HiDocumentText, HiPhoto, HiPlay, HiUserPlus, HiUserGroup,
} from 'react-icons/hi2';
import { formatNumber } from '../../utils';

const AnimatedNumber = ({ value, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView || !value) return;
    let start = 0;
    const end = value;
    const duration = 1000;
    const step = Math.max(1, Math.ceil(end / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return <span ref={ref}>{formatNumber(count)}</span>;
};

const StatCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    whileHover={{ y: -3, scale: 1.02 }}
    className="glass-card p-4 flex flex-col items-center gap-2 cursor-default group transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/5"
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${color} transition-transform duration-300 group-hover:scale-110`}>
      <Icon className="w-4.5 h-4.5 text-white" />
    </div>
    <span className="text-xl font-bold text-white">
      <AnimatedNumber value={value} delay={delay} />
    </span>
    <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{label}</span>
  </motion.div>
);

const LargeStatCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    whileHover={{ y: -4, scale: 1.015 }}
    className="glass-card p-6 flex flex-col items-center gap-2.5 cursor-default group transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/8"
  >
    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br ${color} transition-transform duration-300 group-hover:scale-110`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <span className="text-2xl font-bold text-white">
      <AnimatedNumber value={value} delay={delay} />
    </span>
    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</span>
  </motion.div>
);

const ProfileStats = ({ stats }) => {
  return (
    <div className="space-y-3">
      {/* Section 1: Content Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={HiDocumentText}
          label="Posts"
          value={stats.postsCount}
          color="from-primary/80 to-primary/40"
          delay={0}
        />
        <StatCard
          icon={HiPhoto}
          label="Memories"
          value={stats.memoriesCount}
          color="from-primary/70 to-accent/50"
          delay={1}
        />
        <StatCard
          icon={HiPlay}
          label="Reels"
          value={stats.reelsCount}
          color="from-accent/80 to-accent/40"
          delay={2}
        />
      </div>

      {/* Section 2: Social Stats */}
      <div className="grid grid-cols-2 gap-3">
        <LargeStatCard
          icon={HiUserPlus}
          label="Followers"
          value={stats.followersCount}
          color="from-primary/70 to-primary/30"
          delay={3}
        />
        <LargeStatCard
          icon={HiUserGroup}
          label="Following"
          value={stats.followingCount}
          color="from-accent/70 to-accent/30"
          delay={4}
        />
      </div>
    </div>
  );
};

export default ProfileStats;

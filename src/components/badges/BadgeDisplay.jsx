import { motion } from 'framer-motion';

const BADGE_COLORS = {
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  gold: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  teal: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  red: 'bg-red-500/15 text-red-400 border-red-500/20',
  pink: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  rose: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  orange: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  default: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
};

export const BadgePill = ({ badge, className = '' }) => {
  const colorClass = BADGE_COLORS[badge.color] || BADGE_COLORS.default;

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${colorClass} ${className}`}
      title={badge.label}
    >
      <span className="text-xs leading-none">{badge.icon}</span>
      <span className="hidden sm:inline">{badge.label}</span>
    </span>
  );
};

export const BadgeRow = ({ badges = [], maxDisplay = 6, className = '' }) => {
  if (badges.length === 0) return null;
  const display = badges.slice(0, maxDisplay);
  const overflow = badges.length - maxDisplay;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {display.map((badge, i) => (
        <motion.div
          key={badge.badgeId}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04, type: 'spring', stiffness: 280 }}
        >
          <BadgePill badge={badge} />
        </motion.div>
      ))}
      {overflow > 0 && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] text-gray-500 bg-dark-surface border border-dark-border">
          +{overflow}
        </span>
      )}
    </div>
  );
};

export default BadgeRow;

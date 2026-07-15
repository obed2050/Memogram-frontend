import { motion } from 'framer-motion';
import { formatDate } from '../../utils';

const CATEGORY_COLORS = {
  content: { bg: 'from-blue-500/20 to-indigo-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  engagement: { bg: 'from-rose-500/20 to-pink-500/10', border: 'border-rose-500/30', text: 'text-rose-400' },
  social: { bg: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  school: { bg: 'from-amber-500/20 to-yellow-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  streak: { bg: 'from-orange-500/20 to-red-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
};

const AchievementBadge = ({ achievement, index = 0, compact = false }) => {
  const { earned, name, description, icon, earnedAt, category } = achievement;
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.content;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05, type: 'spring', stiffness: 250 }}
        className={`flex flex-col items-center gap-1 p-2 rounded-xl border w-[72px] ${
          earned
            ? `bg-gradient-to-b ${colors.bg} ${colors.border}`
            : 'bg-dark-surface border-dark-border opacity-35'
        }`}
        title={`${name} — ${description}${earned ? ' ✓' : ''}`}
      >
        <span className={`text-2xl ${earned ? '' : 'grayscale'}`}>{icon}</span>
        <span className="text-[9px] text-gray-400 text-center leading-tight font-medium">{name}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className={`relative overflow-hidden rounded-2xl border p-4 transition-all ${
        earned
          ? `bg-gradient-to-br ${colors.bg} ${colors.border} shadow-lg`
          : 'bg-dark-surface border-dark-border opacity-45'
      }`}
    >
      {earned && (
        <div className="absolute top-2 right-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.06 + 0.2, type: 'spring', stiffness: 300 }}
            className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-md"
          >
            <span className="text-[10px] text-white font-bold">✓</span>
          </motion.div>
        </div>
      )}

      <div className="flex items-start gap-3">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.06 + 0.1, type: 'spring', stiffness: 200 }}
          className={`text-3xl ${earned ? '' : 'grayscale opacity-60'}`}
        >
          {icon}
        </motion.span>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-bold ${earned ? 'text-white' : 'text-gray-500'}`}>{name}</h4>
          <p className={`text-xs mt-0.5 ${earned ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
          {earned && earnedAt && (
            <p className="text-[10px] text-gray-600 mt-1">Earned {formatDate(earnedAt)}</p>
          )}
        </div>
      </div>

      {earned && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.06 + 0.3 }}
          className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${colors.bg.replace('/20', '/60').replace('/10', '/40')}`}
        />
      )}
    </motion.div>
  );
};

export default AchievementBadge;

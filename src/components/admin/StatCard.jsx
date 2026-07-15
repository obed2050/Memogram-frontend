import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color = 'primary', change, changeLabel, delay = 0 }) => {
  const colors = {
    primary: 'from-primary/20 to-primary/5 border-primary/20',
    accent: 'from-accent/20 to-accent/5 border-accent/20',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20',
    rose: 'from-rose-500/20 to-rose-500/5 border-rose-500/20',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/20',
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.08, duration: 0.4 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors[color]} border p-4`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-black text-white mt-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        </div>
        {Icon && (
          <div className={`p-2 rounded-xl bg-dark-surface/60`}>
            <Icon className="w-5 h-5 text-gray-300" />
          </div>
        )}
      </div>
      {change !== undefined && (
        <div className="mt-2 flex items-center gap-1">
          <span className={`text-xs font-semibold ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
          {changeLabel && <span className="text-[10px] text-gray-500">{changeLabel}</span>}
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;

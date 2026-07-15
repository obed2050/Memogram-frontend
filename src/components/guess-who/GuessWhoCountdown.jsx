import { useState, useEffect } from 'react';

const getTimeLeft = (revealAt) => {
  const total = new Date(revealAt).getTime() - Date.now();
  if (total <= 0) return { total: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    total,
    hours: Math.floor(total / (1000 * 60 * 60)),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
};

const GuessWhoCountdown = ({ revealAt, onRevealed, compact = false }) => {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(revealAt));

  useEffect(() => {
    const timer = setInterval(() => {
      const next = getTimeLeft(revealAt);
      setTimeLeft(next);
      if (next.total <= 0) {
        clearInterval(timer);
        onRevealed?.();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [revealAt, onRevealed]);

  if (timeLeft.total <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-semibold">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
        Revealed
      </span>
    );
  }

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary-light rounded-full text-xs font-semibold tabular-nums">
        <span className="w-1.5 h-1.5 bg-primary-light rounded-full animate-pulse" />
        {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {[
        { value: timeLeft.hours, label: 'HRS' },
        { value: timeLeft.minutes, label: 'MIN' },
        { value: timeLeft.seconds, label: 'SEC' },
      ].map(({ value, label }) => (
        <div key={label} className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-dark-surface border border-dark-border flex items-center justify-center">
            <span className="text-2xl font-bold text-white tabular-nums">
              {String(value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-gray-500 mt-1.5 uppercase tracking-wider">{label}</span>
        </div>
      ))}
    </div>
  );
};

export default GuessWhoCountdown;

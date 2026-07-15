import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiFilm, HiCalendarDays, HiHome,
  HiChatBubbleOvalLeftEllipsis, HiDocumentDuplicate,
  HiBookmark, HiPhoto, HiPlus,
} from 'react-icons/hi2';
import { cn } from '../../utils';

const navItems = [
  { path: '/reels', icon: HiFilm, label: 'Reels' },
  { path: '/memories', icon: HiCalendarDays, label: 'Memories' },
  { path: '/', icon: HiHome, label: 'Home', isCenter: true },
  { path: '/messages', icon: HiChatBubbleOvalLeftEllipsis, label: 'Messages' },
  { path: '/drafts', icon: HiDocumentDuplicate, label: 'Drafts' },
  { path: '/saved', icon: HiBookmark, label: 'Saved' },
  { path: '/albums', icon: HiPhoto, label: 'Albums' },
];

const BottomNav = ({ onCreateClick }) => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden">
      <div className="flex items-center gap-1 px-2 py-2 glass rounded-full border border-dark-border/50 shadow-2xl">
        {navItems.map(({ path, icon: Icon, label, isCenter }) => {
          const active = isActive(path);

          if (isCenter) {
            return (
              <div key={path} className="relative -mt-5">
                <button
                  onClick={onCreateClick}
                  className="btn-glow w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  <HiHome className="w-6 h-6" />
                </button>
                {active && (
                  <motion.div
                    layoutId="bottom-active"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gradient-to-r from-primary to-accent"
                  />
                )}
              </div>
            );
          }

          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all min-w-[48px]',
                active ? 'text-white bg-white/5' : 'text-gray-500'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium">{label}</span>
              {active && (
                <motion.div
                  layoutId="bottom-active"
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-gradient-to-r from-primary to-accent"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

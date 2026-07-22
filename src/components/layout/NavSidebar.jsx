import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiHome, HiUserGroup, HiMagnifyingGlass,
  HiGlobeAlt, HiClock, HiQuestionMarkCircle,
  HiCalendarDays, HiAcademicCap, HiArrowRight,
} from 'react-icons/hi2';
import { useAuth } from '../../contexts/AuthContext';
import { exploreService, followService } from '../../services';
import Avatar from '../ui/Avatar';
import { cn } from '../../utils';

const navItems = [
  { id: 'home', path: '/', icon: HiHome, label: 'Home' },
  { id: 'communities', path: '/communities', icon: HiUserGroup, label: 'Communities' },
  { id: 'schools', path: '/communities', icon: HiAcademicCap, label: 'Schools', startsWith: '/communities' },
  { id: 'clubs', path: '/clubs', icon: HiUserGroup, label: 'Clubs' },
  { id: 'memories', path: '/memories', icon: HiCalendarDays, label: 'Memories' },
  { id: 'guess-who', path: '/guess-who', icon: HiQuestionMarkCircle, label: 'Guess Who' },
  { id: 'then-now', path: '/before-now', icon: HiArrowRight, label: 'Then & Now', startsWith: '/before-now' },
  { id: 'on-this-day', path: '/on-this-day', icon: HiClock, label: 'On This Day' },
  { id: 'explore', path: '/explore', icon: HiGlobeAlt, label: 'Explore' },
];

function SuggestionItem({ user: u, onDismiss }) {
  const [following, setFollowing] = useState(u.isFollowing || false);
  const [loading, setLoading] = useState(false);

  const handleFollow = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await followService.toggleFollow(u.id);
      setFollowing((f) => !f);
    } catch {}
    setLoading(false);
  };

  return (
    <Link
      to={`/profile/${u.id}`}
      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-dark-surface/40 transition-all group"
    >
      <Avatar src={u.profilePhoto} name={u.fullName} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-white truncate group-hover:text-primary-light transition-colors leading-tight">
          {u.fullName}
        </p>
        <p className="text-[10px] text-gray-500 truncate leading-tight mt-0.5">
          {u.currentSchool || `@${u.username}`}
          {u.generation ? ` \u00B7 ${u.generation}` : ''}
        </p>
      </div>
      <button
        onClick={handleFollow}
        disabled={loading}
        className={cn(
          'shrink-0 text-[11px] font-semibold px-3 py-1 rounded-lg transition-all',
          following
            ? 'bg-dark-surface text-gray-400 border border-dark-border hover:text-red-400 hover:border-red-500/30'
            : 'bg-primary text-white hover:bg-primary-dark'
        )}
      >
        {following ? 'Following' : 'Follow'}
      </button>
    </Link>
  );
}

const NavSidebar = ({ mobileOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await exploreService.getExplore();
        const users = res.data?.popularUsers || [];
        setSuggestions(users.slice(0, 8));
      } catch {}
      setLoadingSuggestions(false);
    };
    fetch();
  }, []);

  const visibleSuggestions = suggestions.filter((s) => !dismissed.has(s.id));

  const isActive = (path, startsWith) => {
    if (startsWith) return location.pathname.startsWith(startsWith);
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        <span className="text-lg font-bold gradient-text hidden lg:block">Memogram</span>
      </div>

      {/* Navigation - Fixed */}
      <nav className="px-3 space-y-1 shrink-0">
        {navItems.map(({ id, path, icon: Icon, label, startsWith }) => {
          const active = isActive(path, startsWith);
          return (
            <Link
              key={id}
              to={path}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group',
                active
                  ? 'nav-item-active text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-surface/50'
              )}
            >
              <Icon className={cn('w-[20px] h-[20px] shrink-0', active ? 'text-primary-light' : 'text-gray-400 group-hover:text-white')} />
              <span className={cn('nav-label hidden lg:block', active && 'gradient-text font-semibold')}>{label}</span>
              {active && (
                <motion.div
                  layoutId="nav-active"
                  className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary to-accent"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Suggestions - Scrollable below nav */}
      <div className="flex-1 min-h-0 mt-3 px-3 hidden lg:flex flex-col">
        <div className="border-t border-dark-border pt-3 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2 px-1 shrink-0">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Suggestions</h3>
            <Link to="/search" className="text-[10px] font-medium text-primary-light hover:text-primary transition-colors">
              View All
            </Link>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto sidebar-scroll space-y-0.5 pr-1">
            {loadingSuggestions ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2">
                    <div className="skeleton w-8 h-8 rounded-full shrink-0" />
                    <div className="space-y-1 flex-1">
                      <div className="skeleton h-3 w-20" />
                      <div className="skeleton h-2 w-14" />
                    </div>
                    <div className="skeleton h-5 w-14 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : visibleSuggestions.length > 0 ? (
              visibleSuggestions.map((u) => (
                <SuggestionItem
                  key={u.id}
                  user={u}
                  onDismiss={(id) => setDismissed((prev) => new Set([...prev, id]))}
                />
              ))
            ) : (
              <p className="text-[11px] text-gray-600 px-2">No suggestions right now</p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: simple suggestions below nav */}
      <div className="flex-1 min-h-0 mt-3 px-3 lg:hidden overflow-y-auto sidebar-scroll">
        <div className="border-t border-dark-border pt-3">
          <p className="text-[10px] text-gray-600 px-1 mb-2">SUGGESTIONS</p>
          {loadingSuggestions ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2.5 p-2">
                  <div className="skeleton w-8 h-8 rounded-full shrink-0" />
                  <div className="space-y-1 flex-1">
                    <div className="skeleton h-3 w-20" />
                    <div className="skeleton h-2 w-14" />
                  </div>
                </div>
              ))}
            </div>
          ) : visibleSuggestions.length > 0 ? (
            <div className="space-y-0.5">
              {visibleSuggestions.slice(0, 5).map((u) => (
                <SuggestionItem
                  key={u.id}
                  user={u}
                  onDismiss={(id) => setDismissed((prev) => new Set([...prev, id]))}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[280px] shrink-0 h-full border-r border-dark-border bg-dark-card/30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-14 left-0 bottom-0 w-[280px] z-50 bg-dark-card border-r border-dark-border lg:hidden shadow-2xl"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavSidebar;

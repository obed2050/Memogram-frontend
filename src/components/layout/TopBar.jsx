import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiMagnifyingGlass, HiBell, HiPlus, HiBars3,
  HiUser, HiArrowLeftOnRectangle, HiChatBubbleOvalLeftEllipsis,
} from 'react-icons/hi2';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { notificationService, chatService } from '../../services';
import Avatar from '../ui/Avatar';
import { cn } from '../../utils';

const TopBar = ({ onMenuToggle, onCreateClick }) => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationService.getUnreadCount();
        setUnreadCount(res.data.count);
      } catch {}
    };
    fetchUnread();
  }, []);

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const res = await chatService.getConversations();
        const total = (res.data.conversations || []).reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setUnreadMessages(total);
      } catch {}
    };
    fetchUnreadMessages();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('notification', () => {
      setUnreadCount((prev) => prev + 1);
    });
    socket.on('unread_count', (count) => {
      setUnreadMessages(count);
    });
    socket.on('new_message', (message) => {
      if (message?.senderId && user && message.senderId !== user.id) {
        setUnreadMessages((prev) => prev + 1);
      }
    });
    return () => {
      socket.off('notification');
      socket.off('unread_count');
      socket.off('new_message');
    };
  }, [socket, user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchFocused(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-dark-border h-14 md:h-16">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left: Menu (mobile) + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-dark-surface transition-colors lg:hidden"
          >
            <HiBars3 className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-xs">M</span>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className={cn(
            'relative w-full transition-all duration-200',
            searchFocused && 'scale-[1.02]'
          )}>
            <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search memories, people, schools..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-dark-surface border border-dark-border text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </form>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Create Button */}
          <button
            onClick={onCreateClick}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl btn-primary text-white text-sm font-medium hover-lift"
          >
            <HiPlus className="w-4 h-4" />
            <span className="hidden lg:inline">Create</span>
          </button>

          {/* Messages */}
          <Link
            to="/messages"
            className="relative p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-dark-surface transition-all"
          >
            <HiChatBubbleOvalLeftEllipsis className="w-5 h-5" />
            {unreadMessages > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-gradient-to-r from-primary to-primary-dark rounded-full text-[10px] flex items-center justify-center font-bold text-white px-1"
              >
                {unreadMessages > 99 ? '99+' : unreadMessages}
              </motion.span>
            )}
          </Link>

          {/* Notifications */}
          <Link
            to="/notifications"
            className="relative p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-dark-surface transition-all"
          >
            <HiBell className="w-5 h-5" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-gradient-to-r from-red-500 to-red-600 rounded-full text-[10px] flex items-center justify-center font-bold text-white px-1"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.span>
            )}
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-1 rounded-xl hover:bg-dark-surface transition-all"
            >
              <Avatar src={user?.profilePhoto} name={user?.fullName} size="sm" />
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-dark-border">
                    <p className="text-sm font-medium text-white">{user?.fullName}</p>
                    <p className="text-xs text-gray-500">@{user?.username}</p>
                  </div>
                  <div className="p-1.5">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-300 hover:bg-dark-surface hover:text-white transition-colors"
                    >
                      <HiUser className="w-4 h-4" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors w-full"
                    >
                      <HiArrowLeftOnRectangle className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;

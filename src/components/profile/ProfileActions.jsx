import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiPencilSquare, HiArrowUpTray, HiCog,
  HiUserPlus, HiChatBubbleLeft,
  HiChevronDown, HiXMark,
  HiNoSymbol, HiFlag, HiBellSlash,
} from 'react-icons/hi2';
import { chatService } from '../../services';
import toast from 'react-hot-toast';

const ProfileActions = ({
  isOwnProfile,
  isFollowing,
  isPending,
  isPrivate,
  onFollow,
  onUnfollow,
  onEdit,
  onShare,
  profileId,
}) => {
  const navigate = useNavigate();

  const handleMessage = async () => {
    try {
      const res = await chatService.getOrCreateConversation(profileId);
      navigate('/messages', { state: { conversationId: res.data.conversation.id } });
    } catch {
      toast.error('Failed to start conversation');
    }
  };

  if (isOwnProfile) {
    return (
      <div className="flex gap-2">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
          <button
            onClick={onEdit}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-sm font-semibold transition-all duration-200 cursor-pointer"
          >
            <HiPencilSquare className="w-[18px] h-[18px]" />
            Edit Profile
          </button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <button
            onClick={onShare}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-white hover:bg-dark-hover text-sm font-semibold transition-all duration-200 cursor-pointer"
          >
            <HiArrowUpTray className="w-[18px] h-[18px]" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <button className="flex items-center justify-center p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-dark-surface transition-all duration-200 cursor-pointer">
            <HiCog className="w-[18px] h-[18px]" />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <FollowButton
        isFollowing={isFollowing}
        isPending={isPending}
        onFollow={onFollow}
        onUnfollow={onUnfollow}
      />
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
        <button
          onClick={handleMessage}
          className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl glass border border-dark-border text-white hover:bg-dark-hover text-sm font-semibold transition-all duration-200 cursor-pointer"
        >
          <HiChatBubbleLeft className="w-[18px] h-[18px]" />
          Message
        </button>
      </motion.div>
    </div>
  );
};

const FollowButton = ({ isFollowing, isPending, onFollow, onUnfollow }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  if (isPending) {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
        <button
          onClick={onFollow}
          className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-white hover:bg-dark-hover text-sm font-semibold transition-all duration-200 cursor-pointer"
        >
          <HiXMark className="w-[18px] h-[18px]" />
          Requested
        </button>
      </motion.div>
    );
  }

  if (isFollowing) {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-white hover:bg-dark-hover text-sm font-semibold transition-all duration-200 cursor-pointer"
        >
          Following
          <HiChevronDown className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-1.5 bg-dark-card border border-dark-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50"
            >
              <button
                onClick={() => { onUnfollow(); setShowDropdown(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-dark-surface transition-colors cursor-pointer"
              >
                <HiXMark className="w-4 h-4 text-gray-400" />
                Unfollow
              </button>
              <button
                onClick={() => { toast.success('Muted'); setShowDropdown(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-dark-surface transition-colors cursor-pointer"
              >
                <HiBellSlash className="w-4 h-4 text-gray-400" />
                Mute
              </button>
              <button
                onClick={() => { toast.success('Blocked'); setShowDropdown(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-dark-surface transition-colors cursor-pointer"
              >
                <HiNoSymbol className="w-4 h-4 text-gray-400" />
                Block
              </button>
              <div className="border-t border-dark-border" />
              <button
                onClick={() => { toast.success('Reported'); setShowDropdown(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-dark-surface transition-colors cursor-pointer"
              >
                <HiFlag className="w-4 h-4" />
                Report
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
      <button
        onClick={onFollow}
        className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-sm font-semibold transition-all duration-200 cursor-pointer"
      >
        <HiUserPlus className="w-[18px] h-[18px]" />
        Follow
      </button>
    </motion.div>
  );
};

export default ProfileActions;

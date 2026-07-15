import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiMagnifyingGlass, HiXMark } from 'react-icons/hi2';
import Avatar from '../ui/Avatar';
import { formatMessageTime, cn } from '../../utils';

const ConversationList = ({
  conversations,
  activeId,
  onSelect,
  typingUsers,
  onlineUsers,
  searchQuery,
  onSearchChange,
}) => {
  const [focused, setFocused] = useState(false);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => {
      const p = c.participants?.[0];
      return (
        p?.fullName?.toLowerCase().includes(q) ||
        p?.username?.toLowerCase().includes(q) ||
        c.lastMessageContent?.toLowerCase().includes(q)
      );
    });
  }, [conversations, searchQuery]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 shrink-0">
        <div className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl transition-colors',
          'bg-dark-surface border',
          focused ? 'border-primary/40' : 'border-dark-border'
        )}>
          <HiMagnifyingGlass className="w-4 h-4 text-gray-500 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search conversations..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => onSearchChange('')} className="text-gray-500 hover:text-white">
              <HiXMark className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          filtered.map((conv) => {
            const other = conv.participants?.[0];
            if (!other) return null;
            const isActive = activeId === conv.id;
            const isTyping = typingUsers[conv.id]?.length > 0;
            const isOnline = onlineUsers.has(other.id);

            return (
              <motion.button
                key={conv.id}
                onClick={() => onSelect(conv)}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 transition-colors text-left cursor-pointer',
                  isActive ? 'bg-dark-surface' : 'hover:bg-dark-surface/50'
                )}
              >
                <div className="relative shrink-0">
                  <Avatar src={other.profilePhoto} name={other.fullName} size="md" />
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={cn('text-sm truncate', conv.unreadCount > 0 ? 'font-bold text-white' : 'font-medium text-gray-200')}>
                      {other.fullName}
                    </p>
                    <span className="text-[10px] text-gray-500 shrink-0 ml-2">
                      {conv.lastMessageAt ? formatMessageTime(conv.lastMessageAt) : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    {isTyping ? (
                      <span className="text-xs text-primary font-medium">Typing...</span>
                    ) : (
                      <p className={cn(
                        'text-xs truncate',
                        conv.unreadCount > 0 ? 'text-gray-300' : 'text-gray-500'
                      )}>
                        {conv.lastMessageContent
                          ? (conv.lastMessageSenderId === other.id ? '' : 'You: ') + conv.lastMessageContent
                          : conv.lastMessageType === 'voice'
                            ? (conv.lastMessageSenderId === other.id ? '' : 'You: ') + '🎤 Voice message'
                            : 'Start a conversation'
                        }
                      </p>
                    )}
                    {conv.unreadCount > 0 && (
                      <span className="ml-2 shrink-0 w-5 h-5 bg-primary rounded-full text-[10px] flex items-center justify-center font-bold text-white">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;

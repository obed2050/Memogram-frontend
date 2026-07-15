import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiMagnifyingGlass, HiPhone, HiVideoCamera,
  HiArrowLeft, HiXMark,
} from 'react-icons/hi2';
import Avatar from '../ui/Avatar';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { chatService } from '../../services';
import { formatMessageTime } from '../../utils';
import toast from 'react-hot-toast';

const ChatWindow = ({
  conversation,
  messages,
  onSendMessage,
  onDeleteMessage,
  onTypingStart,
  onTypingStop,
  typingUsers,
  onlineUsers,
  currentUserId,
  onBack,
  onLoadOlder,
  hasOlder,
  loadingOlder,
  onStartCall,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedIds, setHighlightedIds] = useState(new Set());
  const [replyTo, setReplyTo] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const other = conversation?.participants?.[0];
  const isOnline = other ? onlineUsers.has(other.id) : false;
  const isTyping = typingUsers?.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || !hasOlder || loadingOlder) return;
    if (container.scrollTop < 100) {
      const prevHeight = container.scrollHeight;
      onLoadOlder?.();
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight - prevHeight;
      });
    }
  }, [hasOlder, loadingOlder, onLoadOlder]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await chatService.searchMessages(conversation.id, { q: searchQuery });
      const results = res.data.data || [];
      setSearchResults(results);
      const ids = new Set(results.map((r) => r.id));
      setHighlightedIds(ids);
      if (results.length > 0) {
        const el = document.getElementById(`msg-${results[0].id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch {
      toast.error('Search failed');
    }
  };

  const handleCopy = (msg) => {
    navigator.clipboard.writeText(msg.content || '');
    toast.success('Copied');
  };

  const handleReply = (msg) => setReplyTo(msg);

  const handleEdit = (msg) => {
    if (msg.messageType === 'voice') return;
    setEditingMsg(msg);
    setReplyTo(null);
  };

  const handleDelete = (msg) => {
    onDeleteMessage(msg.id);
  };

  const handleReact = async (msg, emoji) => {
    try {
      await chatService.toggleReaction(msg.id, emoji);
    } catch {
      toast.error('Failed to react');
    }
  };

  const handleSend = (data) => {
    if (editingMsg) {
      onSendMessage({ ...data, editMessageId: editingMsg.id, content: data.content });
      setEditingMsg(null);
    } else {
      onSendMessage(data);
    }
    setReplyTo(null);
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-dark-card px-6">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 36V12C8 9.79 9.79 8 12 8H36C38.21 8 40 9.79 40 12V28C40 30.21 38.21 32 36 32H16L8 36Z" stroke="url(#grad1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 20H32" stroke="url(#grad2)" strokeWidth="2" strokeLinecap="round" />
              <path d="M16 26H26" stroke="url(#grad2)" strokeWidth="2" strokeLinecap="round" />
              <defs>
                <linearGradient id="grad1" x1="8" y1="8" x2="40" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F4C542" />
                  <stop offset="1" stopColor="#6C3CF0" />
                </linearGradient>
                <linearGradient id="grad2" x1="16" y1="20" x2="32" y2="26" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F4C542" />
                  <stop offset="1" stopColor="#8C6CFF" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-dark-surface border border-dark-border flex items-center justify-center">
            <span className="text-sm">💬</span>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white mb-1.5">Select a conversation</h3>
        <p className="text-sm text-gray-500 text-center max-w-[260px] leading-relaxed">
          Choose from your existing conversations or start a new one
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-dark-card min-w-0">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-border shrink-0">
        {onBack && (
          <button onClick={onBack} className="p-1 text-gray-400 hover:text-white md:hidden cursor-pointer">
            <HiArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="relative">
          <Avatar src={other?.profilePhoto} name={other?.fullName} size="sm" />
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-dark-card" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{other?.fullName}</p>
          <p className="text-[11px] text-gray-500">
            {isTyping ? (
              <span className="text-primary font-medium">Typing...</span>
            ) : isOnline ? (
              'Online'
            ) : other?.lastSeen ? (
              `Last seen ${formatMessageTime(other.lastSeen)}`
            ) : 'Offline'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-dark-surface transition-colors cursor-pointer"
          >
            <HiMagnifyingGlass className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={() => onStartCall?.('voice')}
            className="p-2 rounded-xl text-gray-400 hover:text-primary-light hover:bg-dark-surface transition-colors cursor-pointer"
            title="Voice Call"
          >
            <HiPhone className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={() => onStartCall?.('video')}
            className="p-2 rounded-xl text-gray-400 hover:text-primary-light hover:bg-dark-surface transition-colors cursor-pointer"
            title="Video Call"
          >
            <HiVideoCamera className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-dark-border"
          >
            <div className="flex items-center gap-2 px-4 py-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search in conversation..."
                className="flex-1 bg-dark-surface border border-dark-border rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/40"
                autoFocus
              />
              <button onClick={handleSearch} className="text-primary text-xs font-medium cursor-pointer">Search</button>
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); setHighlightedIds(new Set()); }} className="text-gray-400 cursor-pointer">
                <HiXMark className="w-4 h-4" />
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className="px-4 pb-2 text-xs text-gray-500">
                <span className="text-primary font-medium">{searchResults.length}</span> result{searchResults.length !== 1 ? 's' : ''} found
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3"
      >
        {loadingOlder && (
          <div className="flex justify-center py-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {messages.map((msg, i) => {
          const isOwn = msg.senderId === currentUserId;
          const prevMsg = messages[i - 1];
          const isGrouped = prevMsg && prevMsg.senderId === msg.senderId &&
            (new Date(msg.createdAt) - new Date(prevMsg.createdAt)) < 60000;
          const isHighlighted = highlightedIds.has(msg.id);

          return (
            <div key={msg.id} id={`msg-${msg.id}`}>
              <MessageBubble
                message={msg}
                isOwn={isOwn}
                isGrouped={isGrouped}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCopy={handleCopy}
                onReact={handleReact}
                currentUserId={currentUserId}
                isHighlighted={isHighlighted}
                searchQuery={searchQuery}
              />
            </div>
          );
        })}
        {isTyping && (
          <div className="flex items-center gap-2 mt-3">
            <Avatar src={other?.profilePhoto} name={other?.fullName} size="sm" />
            <div className="px-4 py-2.5 rounded-2xl glass-card-solid rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <AnimatePresence>
        {editingMsg && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-dark-surface border-t border-dark-border text-xs">
              <span className="text-primary-light font-medium">Editing message</span>
              <span className="text-gray-400 truncate flex-1">{editingMsg.content}</span>
              <button onClick={() => setEditingMsg(null)} className="text-gray-500 hover:text-white cursor-pointer">
                <HiXMark className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MessageInput
        onSend={handleSend}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
};

export default ChatWindow;

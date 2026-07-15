import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { chatService } from '../services';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import CallModal from '../components/chat/CallModal';
import { cn } from '../utils';
import toast from 'react-hot-toast';

const MessagesPage = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [pagination, setPagination] = useState({ hasNext: false, page: 1 });
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callType, setCallType] = useState('voice');
  const [callUser, setCallUser] = useState(null);
  const typingTimers = useRef({});
  const notificationsEnabled = useRef(false);
  const conversationsRef = useRef(conversations);
  const activeConversationRef = useRef(activeConversation);
  const userRef = useRef(user);

  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);
  useEffect(() => { activeConversationRef.current = activeConversation; }, [activeConversation]);
  useEffect(() => { userRef.current = user; }, [user]);

  const requestNotificationPermission = useCallback(async () => {
    if (notificationsEnabled.current) return;
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
      notificationsEnabled.current = true;
    }
  }, []);

  const showBrowserNotification = useCallback((title, body, onClick) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, { body, icon: '/favicon.ico', tag: 'memogram-message' });
        notif.onclick = () => {
          window.focus();
          onClick?.();
          notif.close();
        };
      } catch {}
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await chatService.getConversations();
      setConversations(res.data.conversations);
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);
  useEffect(() => { requestNotificationPermission(); }, [requestNotificationPermission]);

  useEffect(() => {
    const state = location.state;
    if (state?.conversationId && conversations.length > 0) {
      const conv = conversations.find((c) => c.id === state.conversationId);
      if (conv) selectConversation(conv);
    }
  }, [location.state, conversations]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      const activeConv = activeConversationRef.current;
      const currentUser = userRef.current;

      // Sender should NEVER process incoming messages as "new"
      if (message.senderId === currentUser?.id) return;

      if (message.conversationId === activeConv?.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      } else {
        const senderName = message.sender?.fullName || 'Someone';
        let preview = message.content || '';
        if (message.messageType === 'image') preview = '📷 Image';
        else if (message.messageType === 'video') preview = '🎬 Video';
        else if (message.messageType === 'voice') preview = '🎤 Voice message';
        showBrowserNotification(
          senderName,
          preview,
          () => {
            const c = conversationsRef.current.find((x) => x.id === message.conversationId);
            if (c) selectConversation(c);
          }
        );
      }

      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id === message.conversationId) {
            const isActiveChat = message.conversationId === activeConv?.id;
            return {
              ...c,
              lastMessage: message,
              lastMessageContent: message.content,
              lastMessageSenderId: message.senderId,
              lastMessageType: message.messageType,
              lastMessageAt: message.createdAt,
              unreadCount: isActiveChat ? 0 : (c.unreadCount || 0) + 1,
            };
          }
          return c;
        });
        const moved = updated.find((c) => c.id === message.conversationId);
        if (moved) {
          const rest = updated.filter((c) => c.id !== message.conversationId);
          return [moved, ...rest];
        }
        return updated;
      });
    };

    const handleMessageEdited = (message) => {
      setMessages((prev) => prev.map((m) => m.id === message.id ? { ...m, ...message } : m));
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, isDeleted: true, content: null, imageUrl: null, videoUrl: null, audioUrl: null } : m));
    };

    const handleMessageReaction = ({ messageId, reactions }) => {
      setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, reactions } : m));
    };

    const handleMessageSent = (message) => {
      const activeConv = activeConversationRef.current;
      if (message.conversationId === activeConv?.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
      // Sender NEVER gets unread badge — always set to 0
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id === message.conversationId) {
            return {
              ...c,
              lastMessage: message,
              lastMessageContent: message.content,
              lastMessageSenderId: message.senderId,
              lastMessageType: message.messageType,
              lastMessageAt: message.createdAt,
              unreadCount: 0,
            };
          }
          return c;
        });
        const moved = updated.find((c) => c.id === message.conversationId);
        if (moved) {
          const rest = updated.filter((c) => c.id !== message.conversationId);
          return [moved, ...rest];
        }
        return updated;
      });
    };

    const handleMessageStatus = ({ messageId, messageIds, conversationId, deliveryStatus }) => {
      if (messageId) {
        setMessages((prev) => prev.map((m) =>
          m.id === messageId ? { ...m, deliveryStatus } : m
        ));
      }
      if (messageIds?.length > 0) {
        const idSet = new Set(messageIds);
        setMessages((prev) => prev.map((m) =>
          idSet.has(m.id) ? { ...m, isRead: true, deliveryStatus } : m
        ));
      }
      if (deliveryStatus === 'seen' && conversationId) {
        setMessages((prev) => prev.map((m) =>
          m.conversationId === conversationId && m.senderId === userRef.current?.id
            ? { ...m, isRead: true, deliveryStatus: 'seen' }
            : m
        ));
      }
    };

    const handleUserTyping = ({ userId, conversationId }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []).filter((id) => id !== userId), userId],
      }));
      clearTimeout(typingTimers.current[`${conversationId}:${userId}`]);
      typingTimers.current[`${conversationId}:${userId}`] = setTimeout(() => {
        setTypingUsers((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] || []).filter((id) => id !== userId),
        }));
      }, 5000);
    };

    const handleUserStopTyping = ({ userId, conversationId }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).filter((id) => id !== userId),
      }));
    };

    const handleMessagesRead = ({ conversationId }) => {
      setMessages((prev) => prev.map((m) =>
        m.conversationId === conversationId && m.senderId === userRef.current?.id
          ? { ...m, isRead: true, deliveryStatus: 'seen' }
          : m
      ));
    };

    const handleConversationUnreadReset = ({ conversationId }) => {
      setConversations((prev) => prev.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ));
    };

    const handleUserOnline = ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    };

    const handleUserOffline = ({ userId }) => {
      setOnlineUsers((prev) => { const s = new Set(prev); s.delete(userId); return s; });
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('message_reaction', handleMessageReaction);
    socket.on('message_status', handleMessageStatus);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);
    socket.on('messages_read', handleMessagesRead);
    socket.on('conversation_unread_reset', handleConversationUnreadReset);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_sent', handleMessageSent);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('message_reaction', handleMessageReaction);
      socket.off('message_status', handleMessageStatus);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.off('messages_read', handleMessagesRead);
      socket.off('conversation_unread_reset', handleConversationUnreadReset);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
    };
  }, [socket, showBrowserNotification]);

  const selectConversation = async (conv) => {
    setActiveConversation(conv);
    setMessages([]);
    setPagination({ hasNext: false, page: 1 });
    try {
      const res = await chatService.getMessages(conv.id, { page: 1, limit: 50 });
      const data = res.data;
      setMessages(data.data || []);
      setPagination({ hasNext: data.pagination?.hasNext || false, page: 1 });
      await chatService.markAsRead(conv.id);
      setConversations((prev) => prev.map((c) => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
      if (socket) socket.emit('mark_read', { conversationId: conv.id });
    } catch {
      toast.error('Failed to load messages');
    }
  };

  const loadOlderMessages = useCallback(async () => {
    if (!activeConversation || loadingOlder || !pagination.hasNext) return;
    setLoadingOlder(true);
    try {
      const nextPage = pagination.page + 1;
      const res = await chatService.getMessages(activeConversation.id, { page: nextPage, limit: 50 });
      const data = res.data;
      const older = data.data || [];
      setMessages((prev) => [...older, ...prev]);
      setPagination({ hasNext: data.pagination?.hasNext || false, page: nextPage });
    } catch {
      toast.error('Failed to load older messages');
    } finally {
      setLoadingOlder(false);
    }
  }, [activeConversation, pagination, loadingOlder]);

  const handleSendMessage = (data) => {
    if (!activeConversation || !socket) return;

    if (data.editMessageId) {
      socket.emit('edit_message', { messageId: data.editMessageId, content: data.content });
      return;
    }

    socket.emit('send_message', {
      conversationId: activeConversation.id,
      content: data.content,
      imageUrl: data.imageUrl,
      videoUrl: data.videoUrl,
      audioUrl: data.audioUrl,
      duration: data.duration,
      messageType: data.messageType,
      replyToId: data.replyToId,
      attachments: data.attachments,
    });
  };

  const handleDeleteMessage = (messageId) => {
    if (!socket) return;
    socket.emit('delete_message', { messageId });
  };

  const handleTypingStart = () => {
    if (socket && activeConversation) {
      socket.emit('typing_start', { conversationId: activeConversation.id });
    }
  };

  const handleTypingStop = () => {
    if (socket && activeConversation) {
      socket.emit('typing_stop', { conversationId: activeConversation.id });
    }
  };

  const handleStartCall = (type) => {
    if (!activeConversation) return;
    const other = activeConversation.participants?.[0];
    if (!other) return;
    setCallType(type);
    setCallUser(other);
    setCallModalOpen(true);
  };

  const activeTyping = activeConversation ? (typingUsers[activeConversation.id] || []) : [];

  return (
    <>
      <div className="flex h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
        <div className={cn(
          'w-full md:w-80 lg:w-[340px] border-r border-dark-border flex flex-col shrink-0',
          activeConversation ? 'hidden md:flex' : 'flex'
        )}>
          <div className="p-4 border-b border-dark-border shrink-0">
            <h2 className="text-lg font-bold text-white">Messages</h2>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="skeleton w-11 h-11 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3.5 w-28 rounded" />
                    <div className="skeleton h-2.5 w-36 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              activeId={activeConversation?.id}
              onSelect={selectConversation}
              typingUsers={typingUsers}
              onlineUsers={onlineUsers}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}
        </div>

        <ChatWindow
          conversation={activeConversation}
          messages={messages}
          onSendMessage={handleSendMessage}
          onDeleteMessage={handleDeleteMessage}
          onTypingStart={handleTypingStart}
          onTypingStop={handleTypingStop}
          typingUsers={activeTyping}
          onlineUsers={onlineUsers}
          currentUserId={user?.id}
          onBack={() => setActiveConversation(null)}
          onLoadOlder={loadOlderMessages}
          hasOlder={pagination.hasNext}
          loadingOlder={loadingOlder}
          onStartCall={handleStartCall}
        />
      </div>

      <CallModal
        isOpen={callModalOpen}
        onClose={() => { setCallModalOpen(false); setCallUser(null); }}
        callType={callType}
        otherUser={callUser}
        conversationId={activeConversation?.id}
      />
    </>
  );
};

export default MessagesPage;

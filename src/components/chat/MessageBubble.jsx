import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiCheck, HiCheckBadge,
  HiPencilSquare, HiTrash, HiClipboardDocument, HiArrowUturnLeft,
} from 'react-icons/hi2';
import Avatar from '../ui/Avatar';
import VoiceMessage from './VoiceMessage';
import { formatMessageTime, cn } from '../../utils';

const QUICK_REACTIONS = ['❤️', '😂', '😮', '😢', '🔥', '👍'];

const highlightText = (text, query) => {
  if (!text || !query?.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-primary/30 text-primary-light rounded px-0.5">{part}</mark>
    ) : part
  );
};

const ImageGrid = ({ attachments, imageUrl }) => {
  const images = useMemo(() => {
    const list = [];
    if (attachments?.length > 0) {
      attachments.filter((a) => a.type === 'image').forEach((a) => list.push(a.url));
    }
    if (imageUrl && !list.includes(imageUrl)) list.push(imageUrl);
    return list;
  }, [attachments, imageUrl]);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt=""
        className="rounded-xl max-w-[280px] max-h-[300px] object-cover mb-1 cursor-pointer hover:opacity-90 transition-opacity"
      />
    );
  }

  const gridClass = images.length === 2 ? 'grid-cols-2'
    : images.length <= 4 ? 'grid-cols-2'
    : 'grid-cols-3';

  return (
    <div className={cn('grid gap-1 mb-1 max-w-[320px]', gridClass)}>
      {images.slice(0, 9).map((url, i) => (
        <div key={i} className="relative overflow-hidden rounded-lg">
          <img
            src={url}
            alt=""
            className="w-full h-full object-cover aspect-square cursor-pointer hover:opacity-90 transition-opacity"
          />
          {i === 8 && images.length > 9 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-bold text-lg">+{images.length - 9}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const VideoPlayer = ({ videoUrl, attachments }) => {
  const url = useMemo(() => {
    if (videoUrl) return videoUrl;
    const video = attachments?.find((a) => a.type === 'video');
    return video?.url;
  }, [videoUrl, attachments]);

  if (!url) return null;

  return (
    <video
      src={url}
      controls
      className="rounded-xl max-w-[280px] max-h-[300px] mb-1"
      preload="metadata"
    />
  );
};

const MessageBubble = ({
  message,
  isOwn,
  isGrouped,
  onReply,
  onEdit,
  onDelete,
  onCopy,
  onReact,
  currentUserId,
  isHighlighted,
  searchQuery,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const actionsRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target)) {
        setShowActions(false);
        setShowReactions(false);
      }
    };
    if (showActions) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showActions]);

  if (message.isDeleted) {
    return (
      <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start', isGrouped ? 'mt-0.5' : 'mt-3')}>
        <div className={cn(
          'px-4 py-2.5 rounded-2xl text-sm italic',
          isOwn ? 'bg-dark-surface text-gray-500 rounded-br-md' : 'bg-dark-surface text-gray-500 rounded-bl-md'
        )}>
          Message deleted
        </div>
      </div>
    );
  }

  const sender = message.sender;
  const replyTo = message.replyTo;
  const reactions = message.reactions || [];
  const reads = message.reads || [];

  const groupedReactions = reactions.reduce((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = { emoji: r.emoji, count: 0, users: [], hasOwn: false };
    acc[r.emoji].count++;
    acc[r.emoji].users.push(r.user?.fullName);
    if (r.userId === currentUserId) acc[r.emoji].hasOwn = true;
    return acc;
  }, {});

  const readCount = reads.filter((r) => r.userId !== message.senderId).length;
  const readStatus = !isOwn ? null
    : message.deliveryStatus === 'seen' ? 'seen'
    : message.deliveryStatus === 'delivered' ? 'delivered'
    : readCount > 0 ? 'seen'
    : message.isRead ? 'delivered'
    : 'sent';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      id={`msg-${message.id}`}
      className={cn(
        'flex group',
        isOwn ? 'justify-end' : 'justify-start',
        isGrouped ? 'mt-0.5' : 'mt-3',
        isHighlighted && 'ring-2 ring-primary/50 rounded-2xl'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowReactions(false); }}
    >
      <div className={cn('flex gap-2 max-w-[75%]', isOwn ? 'flex-row-reverse' : 'flex-row')}>
        {!isOwn && !isGrouped && (
          <Avatar src={sender?.profilePhoto} name={sender?.fullName} size="sm" className="mt-1 shrink-0" />
        )}
        {!isOwn && isGrouped && <div className="w-8 shrink-0" />}

        <div className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start')}>
          {!isOwn && !isGrouped && (
            <span className="text-[11px] text-gray-500 mb-1 ml-1">{sender?.fullName}</span>
          )}

          {replyTo && (
            <div className={cn(
              'mb-1 px-3 py-1.5 rounded-lg text-xs border-l-2 max-w-[240px] truncate',
              'bg-dark-surface/80 border-primary/40 text-gray-400'
            )}>
              <span className="font-medium text-primary-light">
                {replyTo.isDeleted ? 'Deleted message' : (replyTo.sender?.fullName || 'Unknown')}
              </span>
              {!replyTo.isDeleted && (
                <>: {replyTo.content || (replyTo.messageType === 'voice' ? '🎤 Voice message' : replyTo.messageType === 'image' ? '📷 Image' : replyTo.messageType === 'video' ? '🎬 Video' : '')}</>
              )}
            </div>
          )}

          <div className="relative">
            <div className={cn(
              'px-4 py-2.5 text-sm',
              isOwn
                ? 'bg-gradient-to-br from-primary/90 via-primary-light/70 to-accent/60 text-white rounded-2xl rounded-br-md'
                : 'glass-card-solid text-gray-100 rounded-2xl rounded-bl-md'
            )}>
              <ImageGrid attachments={message.attachments} imageUrl={message.imageUrl} />
              <VideoPlayer videoUrl={message.videoUrl} attachments={message.attachments} />

              {message.messageType === 'voice' && message.audioUrl && (
                <VoiceMessage
                  audioUrl={message.audioUrl}
                  duration={message.duration}
                  isOwn={isOwn}
                />
              )}

              {message.content && (
                <p className="whitespace-pre-wrap break-words">
                  {isHighlighted && searchQuery
                    ? highlightText(message.content, searchQuery)
                    : message.content
                  }
                </p>
              )}

              <div className={cn('flex items-center gap-1 mt-1', isOwn ? 'justify-end' : 'justify-start')}>
                {message.isEdited && (
                  <span className="text-[10px] opacity-60">edited</span>
                )}
                <span className="text-[10px] opacity-60">
                  {formatMessageTime(message.createdAt)}
                </span>
                {isOwn && <ReadReceipt status={readStatus} />}
              </div>
            </div>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={cn(
                    'absolute top-0 flex items-center gap-0.5 p-0.5 rounded-lg bg-dark-card border border-dark-border shadow-lg z-10',
                    isOwn ? '-left-16' : '-right-16'
                  )}
                  ref={actionsRef}
                >
                  <ActionBtn icon={HiArrowUturnLeft} onClick={() => onReply?.(message)} title="Reply" />
                  <ActionBtn
                    icon={null}
                    emoji="😀"
                    onClick={() => setShowReactions(!showReactions)}
                    title="React"
                  />
                  <ActionBtn icon={HiClipboardDocument} onClick={() => onCopy?.(message)} title="Copy" />
                  {isOwn && message.messageType !== 'voice' && <ActionBtn icon={HiPencilSquare} onClick={() => onEdit?.(message)} title="Edit" />}
                  {isOwn && <ActionBtn icon={HiTrash} onClick={() => onDelete?.(message)} title="Delete" />}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showReactions && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.9 }}
                  className={cn(
                    'absolute -top-10 flex items-center gap-1 px-2 py-1 rounded-full bg-dark-card border border-dark-border shadow-xl z-20',
                    isOwn ? 'right-0' : 'left-0'
                  )}
                >
                  {QUICK_REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => { onReact?.(message, emoji); setShowReactions(false); }}
                      className="text-lg hover:scale-125 transition-transform p-0.5 cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {Object.keys(groupedReactions).length > 0 && (
            <div className={cn('flex flex-wrap gap-1 mt-1', isOwn ? 'justify-end' : 'justify-start')}>
              {Object.values(groupedReactions).map((r) => (
                <button
                  key={r.emoji}
                  onClick={() => onReact?.(message, r.emoji)}
                  className={cn(
                    'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors cursor-pointer',
                    r.hasOwn
                      ? 'bg-primary/15 border-primary/30 text-primary-light'
                      : 'bg-dark-surface border-dark-border text-gray-400 hover:border-primary/30'
                  )}
                >
                  <span>{r.emoji}</span>
                  <span>{r.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ActionBtn = ({ icon: Icon, emoji, onClick, title }) => (
  <button
    onClick={onClick}
    title={title}
    className="p-1.5 rounded-md hover:bg-dark-surface text-gray-400 hover:text-white transition-colors cursor-pointer"
  >
    {Icon ? <Icon className="w-3.5 h-3.5" /> : <span className="text-sm">{emoji}</span>}
  </button>
);

const ReadReceipt = ({ status }) => {
  if (status === 'seen') {
    return <HiCheckBadge className="w-3.5 h-3.5 text-blue-400" />;
  }
  if (status === 'delivered') {
    return (
      <span className="relative">
        <HiCheckBadge className="w-3.5 h-3.5 text-gray-400" />
      </span>
    );
  }
  return <HiCheck className="w-3.5 h-3.5 opacity-60" />;
};

export default MessageBubble;

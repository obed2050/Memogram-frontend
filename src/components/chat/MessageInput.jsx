import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiPaperAirplane, HiPhoto, HiFaceSmile, HiXMark,
} from 'react-icons/hi2';
import { chatService } from '../../services';
import { cn } from '../../utils';
import toast from 'react-hot-toast';
import VoiceRecorder from './VoiceRecorder';

const EMOJI_LIST = ['😀', '😂', '😍', '🥰', '😎', '🤩', '😢', '😤', '🔥', '❤️', '👍', '👏', '🙏', '🎉', '💯', '🤔', '😴', '🥳', '😇', '🤗'];

const MessageInput = ({ onSend, onTypingStart, onTypingStop, replyTo, onCancelReply }) => {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef(null);
  const fileRef = useRef(null);
  const emojiRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmoji(false);
    };
    if (showEmoji) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmoji]);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, []);

  useEffect(() => { autoResize(); }, [text, autoResize]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed && mediaFiles.length === 0) return;

    let attachments = [];
    let imageUrl = null;
    let videoUrl = null;
    let messageType = 'text';

    if (mediaFiles.length > 0) {
      try {
        setUploading(true);
        const uploaded = await Promise.all(
          mediaFiles.map(async (file) => {
            const fd = new FormData();
            fd.append('file', file);
            const res = await chatService.uploadMedia(fd);
            return { url: res.data.url, type: res.data.type, mimeType: res.data.mimeType, fileSize: res.data.fileSize };
          })
        );
        attachments = uploaded;
        const images = uploaded.filter((a) => a.type === 'image');
        const videos = uploaded.filter((a) => a.type === 'video');
        if (images.length > 0) imageUrl = images[0].url;
        if (videos.length > 0) videoUrl = videos[0].url;
        if (images.length > 1 || (images.length > 0 && videos.length > 0)) {
          messageType = 'image';
        } else if (videos.length > 0) {
          messageType = 'video';
        } else {
          messageType = 'image';
        }
      } catch {
        toast.error('Failed to upload media');
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    onSend({
      content: trimmed || null,
      imageUrl: attachments.length === 0 ? null : imageUrl,
      videoUrl: attachments.length === 0 ? null : videoUrl,
      messageType: trimmed && attachments.length === 0 ? 'text' : messageType,
      replyToId: replyTo?.id || null,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    setText('');
    setMediaFiles([]);
    setMediaPreviews([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const valid = files.filter((f) => {
      if (!f.type.startsWith('image/') && !f.type.startsWith('video/')) {
        toast.error(`${f.name}: Only images and videos allowed`);
        return false;
      }
      if (f.size > 50 * 1024 * 1024) {
        toast.error(`${f.name}: File too large (max 50MB)`);
        return false;
      }
      return true;
    });

    const totalAfter = mediaFiles.length + valid.length;
    if (totalAfter > 10) {
      toast.error('Maximum 10 files allowed');
      return;
    }

    setMediaFiles((prev) => [...prev, ...valid]);
    const newPreviews = valid.map((f) => ({
      url: URL.createObjectURL(f),
      type: f.type.startsWith('video/') ? 'video' : 'image',
      name: f.name,
    }));
    setMediaPreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const removeMedia = (index) => {
    URL.revokeObjectURL(mediaPreviews[index]?.url);
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVoiceSend = async (audioBlob, duration) => {
    setIsRecording(false);
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', audioBlob);
      const res = await chatService.uploadVoice(fd);
      onSend({
        content: null,
        audioUrl: res.data.url,
        duration,
        messageType: 'voice',
        replyToId: replyTo?.id || null,
      });
    } catch {
      toast.error('Failed to upload voice message');
    } finally {
      setUploading(false);
    }
  };

  const handleVoiceCancel = () => {
    setIsRecording(false);
  };

  useEffect(() => {
    const current = [...mediaPreviews];
    return () => {
      current.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, []);

  return (
    <div className="border-t border-dark-border bg-dark-card p-3">
      <AnimatePresence>
        {isRecording && (
          <VoiceRecorder onSend={handleVoiceSend} onCancel={handleVoiceCancel} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {replyTo && !isRecording && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-dark-surface rounded-xl border-l-2 border-primary/40">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-primary-light">Replying to {replyTo.sender?.fullName}</p>
                <p className="text-xs text-gray-400 truncate">{replyTo.content || (replyTo.messageType === 'voice' ? '🎤 Voice message' : 'Media')}</p>
              </div>
              <button onClick={onCancelReply} className="text-gray-500 hover:text-white cursor-pointer">
                <HiXMark className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mediaPreviews.length > 0 && !isRecording && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 mb-2 overflow-x-auto pb-1 hide-scrollbar">
              {mediaPreviews.map((preview, i) => (
                <div key={i} className="relative shrink-0">
                  {preview.type === 'video' ? (
                    <video src={preview.url} className="h-20 rounded-xl object-cover" />
                  ) : (
                    <img src={preview.url} alt="" className="h-20 w-20 rounded-xl object-cover" />
                  )}
                  <button
                    onClick={() => removeMedia(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-dark-card border border-dark-border rounded-full flex items-center justify-center cursor-pointer hover:bg-red-500/20 hover:border-red-500/30 transition-colors"
                  >
                    <HiXMark className="w-3 h-3 text-white" />
                  </button>
                  <span className="absolute bottom-1 left-1 text-[9px] text-white bg-black/60 px-1 rounded">
                    {preview.type === 'video' ? '🎬' : '📷'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isRecording && (
        <div className="flex items-end gap-2">
          <div className="relative" ref={emojiRef}>
            <button
              onClick={() => setShowEmoji(!showEmoji)}
              className="p-2 rounded-xl text-gray-400 hover:text-primary-light hover:bg-dark-surface transition-colors cursor-pointer"
            >
              <HiFaceSmile className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {showEmoji && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute bottom-12 left-0 p-2 bg-dark-card border border-dark-border rounded-xl shadow-xl grid grid-cols-5 gap-1 w-[220px] z-30"
                >
                  {EMOJI_LIST.map((e) => (
                    <button
                      key={e}
                      onClick={() => { setText((t) => t + e); setShowEmoji(false); }}
                      className="text-xl p-1 hover:bg-dark-surface rounded-lg transition-colors cursor-pointer"
                    >
                      {e}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="p-2 rounded-xl text-gray-400 hover:text-primary-light hover:bg-dark-surface transition-colors cursor-pointer"
          >
            <HiPhoto className="w-5 h-5" />
          </button>

          <div className="flex-1 bg-dark-surface border border-dark-border rounded-xl overflow-hidden focus-within:border-primary/40 transition-colors">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => { setText(e.target.value); onTypingStart?.(); }}
              onKeyDown={handleKeyDown}
              onBlur={onTypingStop}
              placeholder="Type a message..."
              rows={1}
              className="w-full bg-transparent px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none resize-none"
            />
          </div>

          {(text.trim() || mediaFiles.length > 0) ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={uploading}
              className={cn(
                'p-2.5 rounded-xl transition-all cursor-pointer',
                'btn-primary'
              )}
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <HiPaperAirplane className="w-5 h-5" />
              )}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsRecording(true)}
              disabled={uploading}
              className="p-2.5 rounded-xl bg-dark-surface text-gray-400 hover:text-primary-light hover:bg-dark-card transition-colors cursor-pointer"
              title="Record voice message"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageInput;

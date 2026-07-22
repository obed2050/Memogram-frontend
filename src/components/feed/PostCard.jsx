import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiHeart, HiChatBubbleOvalLeft, HiShare, HiBookmark,
  HiEllipsisVertical, HiPlay, HiPause, HiAcademicCap,
  HiCalendarDays, HiBuildingLibrary,
} from 'react-icons/hi2';
import Avatar from '../ui/Avatar';
import MediaViewer from '../ui/MediaViewer';
import { likeService } from '../../services';
import { formatDate, cn, formatNumber } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';

const formatMemoryLabel = (post) => {
  const school = post.author?.currentSchool || post.school?.name;
  const graduationYear = post.author?.graduationYear || post.graduationYear;
  const createdAt = new Date(post.createdAt);
  const now = new Date();
  const diffYears = now.getFullYear() - createdAt.getFullYear();
  const diffMonths = (now.getFullYear() - createdAt.getFullYear()) * 12 + now.getMonth() - createdAt.getMonth();

  const parts = [];
  if (school) parts.push({ icon: HiBuildingLibrary, text: school });
  if (graduationYear) parts.push({ icon: HiAcademicCap, text: `Class of ${graduationYear}` });
  if (diffYears > 0) parts.push({ icon: HiCalendarDays, text: diffYears === 1 ? '1 Year Ago' : `${diffYears} Years Ago` });
  else if (diffMonths > 0) parts.push({ icon: HiCalendarDays, text: diffMonths === 1 ? '1 Month Ago' : `${diffMonths} Months Ago` });
  else parts.push({ icon: HiCalendarDays, text: 'Recently' });

  return parts;
};

const ImageGrid = ({ images, onImageClick }) => {
  const count = images.length;

  if (count === 1) {
    return (
      <button
        onClick={() => onImageClick(0)}
        className="w-full cursor-zoom-in"
      >
        <img
          src={images[0]}
          alt=""
          loading="lazy"
          className="w-full max-h-[700px] object-contain rounded-[18px] bg-dark-surface"
        />
      </button>
    );
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-[3px] rounded-[18px] overflow-hidden">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => onImageClick(i)}
            className="relative cursor-zoom-in"
          >
            <img
              src={img}
              alt=""
              loading="lazy"
              className="w-full h-[280px] md:h-[340px] object-cover"
            />
          </button>
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="grid grid-cols-2 gap-[3px] rounded-[18px] overflow-hidden">
        <button
          onClick={() => onImageClick(0)}
          className="row-span-2 cursor-zoom-in"
        >
          <img
            src={images[0]}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover min-h-[280px] md:min-h-[340px]"
          />
        </button>
        <div className="grid grid-rows-2 gap-[3px]">
          {images.slice(1, 3).map((img, i) => (
            <button
              key={i}
              onClick={() => onImageClick(i + 1)}
              className="cursor-zoom-in"
            >
              <img
                src={img}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover min-h-[138px] md:min-h-[168px]"
              />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (count === 4) {
    return (
      <div className="grid grid-cols-2 gap-[3px] rounded-[18px] overflow-hidden">
        {images.slice(0, 4).map((img, i) => (
          <button
            key={i}
            onClick={() => onImageClick(i)}
            className="cursor-zoom-in"
          >
            <img
              src={img}
              alt=""
              loading="lazy"
              className="w-full h-[170px] md:h-[210px] object-cover"
            />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-[3px] rounded-[18px] overflow-hidden">
      {images.slice(0, 4).map((img, i) => (
        <button
          key={i}
          onClick={() => onImageClick(i)}
          className="relative cursor-zoom-in"
        >
          <img
            src={img}
            alt=""
            loading="lazy"
            className="w-full h-[170px] md:h-[210px] object-cover"
          />
          {i === 3 && count > 4 && (
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">+{count - 4}</span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

const VideoPlayer = ({ src, onOpenFullscreen }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress(video.duration ? (video.currentTime / video.duration) * 100 : 0);
    };
    const onLoadedMetadata = () => setDuration(video.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, []);

  const togglePlay = useCallback((e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  const toggleMute = useCallback((e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleSeek = useCallback((e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
  }, []);

  const formatVideoTime = (sec) => {
    if (!sec || !isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative group rounded-[18px] overflow-hidden bg-dark-surface"
      onMouseEnter={() => { setIsHovered(true); setShowControls(true); }}
      onMouseLeave={() => { setIsHovered(false); setShowControls(false); }}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full max-h-[700px] object-contain"
        playsInline
        muted={isMuted}
        preload="metadata"
        onClick={togglePlay}
        onDoubleClick={(e) => { e.stopPropagation(); onOpenFullscreen(); }}
      />

      <AnimatePresence>
        {(showControls || !isPlaying) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none"
          >
            <button
              onClick={togglePlay}
              className="pointer-events-auto w-16 h-16 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center hover:bg-white/25 transition-all cursor-pointer"
            >
              {isPlaying ? (
                <HiPause className="w-7 h-7 text-white" />
              ) : (
                <HiPlay className="w-7 h-7 text-white ml-0.5" />
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-8 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div
          className="w-full h-1 bg-white/20 rounded-full cursor-pointer mb-2 group/progress"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-gradient-to-r from-primary to-accent-light rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={togglePlay} className="text-white hover:text-primary-light transition-colors cursor-pointer">
              {isPlaying ? <HiPause className="w-4 h-4" /> : <HiPlay className="w-4 h-4" />}
            </button>
            <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors cursor-pointer text-xs">
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>
          <span className="text-[11px] text-white/70 font-mono tabular-nums">
            {formatVideoTime(currentTime)} / {formatVideoTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};

const ActionBar = ({ likesCount, commentsCount, liked, onLike, onComment, onShare, saved, onSave }) => (
  <div className="flex items-center justify-between px-4 py-2.5">
    <div className="flex items-center gap-0.5">
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={onLike}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-dark-surface transition-all group"
      >
        {liked ? (
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 12 }}
          >
            <HiHeart className="w-[20px] h-[20px] text-red-500 fill-red-500" />
          </motion.div>
        ) : (
          <HiHeart className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
        )}
        <span className={cn('text-xs font-semibold', liked ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-300')}>
          {formatNumber(likesCount)}
        </span>
      </motion.button>

      <button
        onClick={onComment}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-dark-surface text-gray-400 hover:text-primary-light transition-all"
      >
        <HiChatBubbleOvalLeft className="w-5 h-5" />
        <span className="text-xs font-semibold">{formatNumber(commentsCount)}</span>
      </button>

      <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-dark-surface text-gray-400 hover:text-accent-light transition-all">
        <HiShare className="w-5 h-5" />
      </button>
    </div>

    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={onSave}
      className="p-2 rounded-xl hover:bg-dark-surface transition-all"
    >
      <HiBookmark className={cn(
        'w-5 h-5 transition-colors',
        saved ? 'text-primary fill-primary' : 'text-gray-400 hover:text-primary'
      )} />
    </motion.button>
  </div>
);

const Caption = ({ content }) => {
  const [expanded, setExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      setNeedsExpand(textRef.current.scrollHeight > 60);
    }
  }, [content]);

  if (!content) return null;

  const renderContent = (text) => {
    const parts = text.split(/(@\w+|#\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <span key={i} className="text-primary-light font-medium hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      if (part.startsWith('#')) {
        return (
          <span key={i} className="text-accent-light font-medium hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="px-4 pb-3">
      <div className="relative">
        <div
          ref={textRef}
          className={cn(
            'text-[13px] text-gray-200 leading-relaxed whitespace-pre-wrap',
            !expanded && needsExpand && 'max-h-[60px] overflow-hidden'
          )}
        >
          {renderContent(content)}
        </div>
        {needsExpand && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-gray-500 hover:text-primary-light font-medium mt-1 transition-colors cursor-pointer"
          >
            {expanded ? 'Show less' : 'See more'}
          </button>
        )}
      </div>
    </div>
  );
};

const MemoIdentity = ({ post }) => {
  const parts = formatMemoryLabel(post);
  if (!parts.length) return null;

  return (
    <div className="px-4 pb-3">
      <div className="flex items-center gap-1.5 flex-wrap">
        {parts.map((part, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-dark-surface text-gray-400 border border-dark-border"
          >
            <part.icon className="w-3 h-3 text-primary/70" />
            {part.text}
          </span>
        ))}
      </div>
    </div>
  );
};

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [saved, setSaved] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const handleLike = useCallback(async () => {
    try {
      setLiked((prev) => !prev);
      setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
      await likeService.toggleLike(post.id);
    } catch {
      setLiked(liked);
      setLikesCount(post.likesCount);
    }
  }, [liked, likesCount, post.id, post.likesCount]);

  const openViewer = useCallback((index) => {
    setViewerIndex(index);
    setViewerOpen(true);
  }, []);

  const hasMedia = post.images?.length > 0 || post.videos?.length > 0;

  return (
    <>
      <motion.article
        className="glass-card-solid overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <Link to={`/profile/${post.author?.id}`} className="flex items-center gap-3 group">
            <Avatar src={post.author?.profilePhoto} name={post.author?.fullName} size="md" />
            <div>
              <p className="font-semibold text-white text-[13px] group-hover:text-primary-light transition-colors leading-tight">
                {post.author?.fullName}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                {post.author?.username && (
                  <span className="text-gray-500">@{post.author.username}</span>
                )}
                {post.author?.username && post.author?.currentSchool && (
                  <span className="text-gray-600">&middot;</span>
                )}
                {post.author?.currentSchool && (
                  <span className="text-gray-500">{post.author.currentSchool}</span>
                )}
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-600">{formatDate(post.createdAt)}</span>
            {user?.id === post.userId && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 rounded-lg hover:bg-dark-surface text-gray-500 hover:text-white transition-all cursor-pointer"
                >
                  <HiEllipsisVertical className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {showMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 top-full mt-1 bg-dark-card border border-dark-border rounded-2xl py-1.5 w-36 z-20 shadow-2xl"
                      >
                        <button
                          onClick={() => { onDelete?.(post.id); setShowMenu(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          Delete
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        <Caption content={post.content} />

        {hasMedia && (
          <div className="px-[3px]">
            {post.images?.length > 0 && (
              <ImageGrid images={post.images} onImageClick={openViewer} />
            )}
            {post.videos?.length > 0 && !post.images?.length && (
              <VideoPlayer
                src={post.videos[0]}
                onOpenFullscreen={() => {
                  setViewerIndex(0);
                  setViewerOpen(true);
                }}
              />
            )}
          </div>
        )}

        <ActionBar
          likesCount={likesCount}
          commentsCount={post.commentsCount || 0}
          liked={liked}
          onLike={handleLike}
          onComment={() => {}}
          onShare={() => {}}
          saved={saved}
          onSave={() => setSaved(!saved)}
        />

        <MemoIdentity post={post} />
      </motion.article>

      <AnimatePresence>
        {viewerOpen && (
          <MediaViewer
            images={post.images}
            videos={post.videos}
            initialIndex={viewerIndex}
            initialType={post.images?.length ? 'image' : 'video'}
            onClose={() => setViewerOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default memo(PostCard);

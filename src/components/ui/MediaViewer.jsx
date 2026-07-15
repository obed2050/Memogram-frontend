import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { cn } from '../../utils';

const MediaViewer = ({ images, videos, initialIndex = 0, initialType = 'image', onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [videoPlaying, setVideoPlaying] = useState(true);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const lastTouchDistRef = useRef(0);

  const allMedia = [
    ...(images || []).map((url) => ({ url, type: 'image' })),
    ...(videos || []).map((url) => ({ url, type: 'video' })),
  ];

  const current = allMedia[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allMedia.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) {
      setCurrentIndex((i) => i - 1);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [hasPrev]);

  const goNext = useCallback(() => {
    if (hasNext) {
      setCurrentIndex((i) => i + 1);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [hasNext]);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + 0.5, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => {
      const next = Math.max(z - 0.5, 1);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') resetZoom();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, goPrev, goNext, handleZoomIn, handleZoomOut, resetZoom]);

  useEffect(() => {
    if (current?.type === 'video' && videoRef.current) {
      videoRef.current.play().catch(() => {});
      setVideoPlaying(true);
    }
  }, [currentIndex, current?.type]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      setZoom((z) => {
        const next = Math.max(1, Math.min(4, z + delta));
        if (next === 1) setPan({ x: 0, y: 0 });
        return next;
      });
    }
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (zoom > 1) {
      resetZoom();
    } else {
      handleZoomIn();
    }
  }, [zoom, resetZoom, handleZoomIn]);

  const handleMouseDown = useCallback((e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [zoom, pan]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging && zoom > 1) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  }, [isDragging, zoom, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistRef.current = Math.sqrt(dx * dx + dy * dy);
    } else if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
      if (zoom > 1) {
        setIsDragging(true);
        setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
      }
    }
  }, [zoom, pan]);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastTouchDistRef.current > 0) {
        const scale = dist / lastTouchDistRef.current;
        setZoom((z) => {
          const next = Math.max(1, Math.min(4, z * scale));
          if (next === 1) setPan({ x: 0, y: 0 });
          return next;
        });
      }
      lastTouchDistRef.current = dist;
    } else if (e.touches.length === 1 && isDragging && zoom > 1) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  }, [isDragging, zoom, dragStart]);

  const handleTouchEnd = useCallback((e) => {
    lastTouchDistRef.current = 0;
    setIsDragging(false);
    if (e.changedTouches.length === 1 && zoom <= 1) {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const dt = Date.now() - touchStartRef.current.time;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && dt < 300) {
        if (dx > 0) goPrev();
        else goNext();
      }
    }
  }, [zoom, goPrev, goNext]);

  const toggleVideoPlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setVideoPlaying(!videoPlaying);
  }, [videoPlaying]);

  if (!allMedia.length) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center"
        onWheel={handleWheel}
      >
        <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose} />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[210] p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        >
          <HiXMark className="w-5 h-5" />
        </button>

        {allMedia.length > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[210] px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium">
            {currentIndex + 1} / {allMedia.length}
          </div>
        )}

        {hasPrev && (
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-[210] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <HiChevronLeft className="w-6 h-6" />
          </button>
        )}

        {hasNext && (
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-[210] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <HiChevronRight className="w-6 h-6" />
          </button>
        )}

        <div
          ref={containerRef}
          className="relative z-[205] flex items-center justify-center w-full h-full px-16 py-16"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          <AnimatePresence mode="popLayout">
            {current?.type === 'video' ? (
              <motion.div
                key={`video-${currentIndex}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative max-w-full max-h-full"
              >
                <video
                  ref={videoRef}
                  src={current.url}
                  controls
                  className="max-w-full max-h-[85vh] rounded-2xl object-contain"
                  playsInline
                  onPlay={() => setVideoPlaying(true)}
                  onPause={() => setVideoPlaying(false)}
                />
              </motion.div>
            ) : (
              <motion.img
                key={`img-${currentIndex}`}
                src={current?.url}
                alt=""
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: zoom }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="max-w-full max-h-[85vh] rounded-2xl object-contain select-none"
                draggable={false}
                style={{
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  transition: isDragging ? 'none' : 'transform 0.2s ease',
                }}
              />
            )}
          </AnimatePresence>
        </div>

        {zoom > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[210] flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              &minus;
            </button>
            <span className="text-white/60 text-xs font-mono">{Math.round(zoom * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              +
            </button>
          </div>
        )}

        {allMedia.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[210] flex items-center gap-1.5">
            {allMedia.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentIndex(i); setZoom(1); setPan({ x: 0, y: 0 }); }}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-200 cursor-pointer',
                  i === currentIndex ? 'bg-white w-5' : 'bg-white/30 hover:bg-white/50'
                )}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default MediaViewer;

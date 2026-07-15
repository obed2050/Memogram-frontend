import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  HiArrowLeft, HiHeart, HiChatBubbleLeft, HiTrash,
} from 'react-icons/hi2';
import { beforeNowService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import BeforeNowComments from '../components/before-now/BeforeNowComments';
import Avatar from '../components/ui/Avatar';
import { formatDate } from '../utils';
import toast from 'react-hot-toast';

const BeforeNowDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const isOwner = item?.userId === user?.id;

  const fetchItem = useCallback(async () => {
    try {
      const res = await beforeNowService.getOne(id);
      setItem(res.data.beforeNow);
    } catch {
      toast.error('Failed to load comparison');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const handleSliderMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(5, Math.min(95, x)));
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    handleSliderMove(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleSliderMove(e.clientX);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    handleSliderMove(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    handleSliderMove(e.touches[0].clientX);
  };

  const handleLike = async () => {
    try {
      const res = await beforeNowService.toggleLike(item.id);
      setItem((prev) => ({
        ...prev,
        isLiked: res.data.isLiked,
        likesCount: res.data.likesCount,
      }));
    } catch {
      toast.error('Failed to react');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this comparison?')) return;
    try {
      await beforeNowService.delete(item.id);
      toast.success('Deleted');
      window.history.back();
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="skeleton h-52 rounded-2xl" />
        <div className="skeleton h-12 rounded-xl" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Comparison not found</p>
        <Link to="/before-now" className="text-primary-light text-sm mt-2 inline-block">Back to feed</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <Link
        to="/before-now"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
      >
        <HiArrowLeft className="w-4 h-4" />
        Before vs Now
      </Link>

      {/* Card */}
      <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3">
          <Link to={`/profile/${item.author?.id}`} className="flex items-center gap-3">
            <Avatar src={item.author?.profilePhoto} name={item.author?.fullName} size="sm" />
            <div>
              <p className="text-sm font-semibold text-white">{item.author?.fullName}</p>
              <p className="text-xs text-gray-500">{formatDate(item.createdAt)}</p>
            </div>
          </Link>
          {isOwner && (
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-dark-surface text-gray-500 hover:text-red-400 transition-colors"
            >
              <HiTrash className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Title */}
        {item.title && (
          <p className="px-4 pb-3 text-base font-semibold text-white">{item.title}</p>
        )}

        {/* Comparison Slider */}
        <div
          ref={containerRef}
          className="relative w-full aspect-[4/3] cursor-ew-resize select-none overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          <img
            src={item.afterImage}
            alt="Now"
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          >
            <img
              src={item.beforeImage}
              alt="Before"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
          </div>

          {/* Slider Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/80 z-10 pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/80 flex items-center justify-center pointer-events-none shadow-lg shadow-black/30">
              <div className="flex gap-1">
                <div className="w-0.5 h-4 bg-white rounded-full" />
                <div className="w-0.5 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>

          <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full text-[11px] font-semibold text-white/90 uppercase tracking-wider z-10 pointer-events-none">
            Before
          </div>
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full text-[11px] font-semibold text-white/90 uppercase tracking-wider z-10 pointer-events-none">
            Now
          </div>

          {item.beforeYear && (
            <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-primary/80 backdrop-blur-sm rounded-full text-[10px] font-bold text-white z-10 pointer-events-none">
              {item.beforeYear}
            </div>
          )}
          {item.afterYear && (
            <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-accent/80 backdrop-blur-sm rounded-full text-[10px] font-bold text-white z-10 pointer-events-none">
              {item.afterYear}
            </div>
          )}
        </div>

        {/* Captions */}
        {(item.beforeCaption || item.afterCaption) && (
          <div className="flex gap-3 p-4">
            {item.beforeCaption && (
              <div className="flex-1 bg-dark-surface rounded-xl px-3 py-2.5">
                <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Before</p>
                <p className="text-sm text-gray-300">{item.beforeCaption}</p>
              </div>
            )}
            {item.afterCaption && (
              <div className="flex-1 bg-dark-surface rounded-xl px-3 py-2.5">
                <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Now</p>
                <p className="text-sm text-gray-300">{item.afterCaption}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 px-4 pb-4 pt-1">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all ${
              item.isLiked
                ? 'bg-red-500/10 text-red-400'
                : 'text-gray-400 hover:text-red-400 hover:bg-dark-surface'
            }`}
          >
            <HiHeart className={`w-5 h-5 ${item.isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{item.likesCount || 0}</span>
          </button>
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-gray-400">
            <HiChatBubbleLeft className="w-5 h-5" />
            <span className="text-sm font-medium">{item.commentsCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="bg-dark-card rounded-2xl border border-dark-border p-4">
        <BeforeNowComments beforeNowId={id} />
      </div>
    </div>
  );
};

export default BeforeNowDetailPage;

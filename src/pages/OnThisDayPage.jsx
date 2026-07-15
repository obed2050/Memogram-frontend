import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  HiCalendarDays, HiClock, HiHeart, HiChatBubbleLeft, HiFilm,
} from 'react-icons/hi2';
import { onThisDayService } from '../services';
import Avatar from '../components/ui/Avatar';
import { formatDate } from '../utils';
import toast from 'react-hot-toast';

const ITEM_COLORS = [
  'from-primary/20 to-primary/5 border-primary/20',
  'from-accent/20 to-accent/5 border-accent/20',
  'from-blue-500/20 to-blue-500/5 border-blue-500/20',
  'from-rose-500/20 to-rose-500/5 border-rose-500/20',
  'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20',
];

const YEAR_ACCENTS = [
  'bg-primary/20 text-primary-light border-primary/30',
  'bg-accent/20 text-accent-light border-accent/30',
  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'bg-rose-500/20 text-rose-400 border-rose-500/30',
  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
];

const TimelineCard = ({ item, index }) => {
  const colorClass = ITEM_COLORS[index % ITEM_COLORS.length];
  const hasMedia = (item.images && item.images.length > 0) || (item.videos && item.videos.length > 0);

  return (
    <div className={`bg-gradient-to-br ${colorClass} border rounded-2xl overflow-hidden transition-all hover:scale-[1.01]`}>
      {/* Media */}
      {hasMedia && (
        <div className={`grid ${item.images?.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-0.5`}>
          {(item.images || []).slice(0, 4).map((img, i) => (
            <Link
              key={i}
              to={`/post/${item.id}`}
              className={`relative overflow-hidden ${
                item.images.length === 1 ? 'aspect-video' : 'aspect-square'
              } ${item.images.length === 3 && i === 0 ? 'col-span-2 aspect-video' : ''}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
            </Link>
          ))}
          {(item.videos || []).slice(0, 2).map((vid, i) => (
            <Link
              key={`v-${i}`}
              to={`/post/${item.id}`}
              className="relative overflow-hidden aspect-square"
            >
              <video src={vid} className="w-full h-full object-cover" preload="metadata" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <HiFilm className="w-8 h-8 text-white/80" />
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="p-4">
        {/* Author */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <Link to={`/profile/${item.author?.id}`}>
            <Avatar src={item.author?.profilePhoto} name={item.author?.fullName} size="sm" />
          </Link>
          <div className="min-w-0 flex-1">
            <Link to={`/profile/${item.author?.id}`} className="text-sm font-semibold text-white hover:underline">
              {item.author?.fullName}
            </Link>
            <p className="text-xs text-gray-400">
              {formatDate(item.createdAt)}
              {item.school && <span> · {item.school.name}</span>}
            </p>
          </div>
          {item._type === 'memory' && (
            <span className="px-2 py-0.5 bg-accent/20 text-accent-light text-[10px] font-semibold rounded-full uppercase">
              Memory
            </span>
          )}
        </div>

        {/* Content */}
        {item.content && (
          <Link to={`/post/${item.id}`}>
            <p className="text-sm text-gray-200 whitespace-pre-wrap line-clamp-4">{item.content}</p>
          </Link>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-white/5">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <HiHeart className={`w-3.5 h-3.5 ${item.isLiked ? 'text-red-400 fill-current' : ''}`} />
            {item.likesCount || 0}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <HiChatBubbleLeft className="w-3.5 h-3.5" />
            {item.commentsCount || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

const OnThisDayPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await onThisDayService.getMemories();
      setData(res.data);
    } catch {
      toast.error('Failed to load memories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="skeleton h-24 rounded-2xl" />
        <div className="space-y-8">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center gap-1">
                <div className="skeleton w-10 h-10 rounded-full" />
                <div className="skeleton w-0.5 h-full min-h-[80px]" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="skeleton h-5 w-32 rounded-lg" />
                <div className="skeleton h-40 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.memories.length === 0) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/10 rounded-2xl p-6 text-center">
          <HiClock className="w-12 h-12 text-primary/40 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white mb-1">On This Day</h1>
          <p className="text-gray-400 text-sm">{data?.today?.displayDate || new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <div className="text-center py-16">
          <HiCalendarDays className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No memories on this day</p>
          <p className="text-gray-600 text-sm mt-1">
            As you share more, memories will appear here from years past
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/10 rounded-2xl p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-2 left-4 w-20 h-20 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-2 right-4 w-16 h-16 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <HiClock className="w-10 h-10 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-white mb-0.5">On This Day</h1>
          <p className="text-gray-400 text-sm">{data.today.displayDate}</p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
            <span>{data.totalItems} {data.totalItems === 1 ? 'memory' : 'memories'}</span>
            <span>&middot;</span>
            <span>{data.totalYears} {data.totalYears === 1 ? 'year' : 'years'} covered</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {data.memories.map((group, groupIndex) => {
          const accentClass = YEAR_ACCENTS[groupIndex % YEAR_ACCENTS.length];
          return (
            <div key={group.year} className="relative flex gap-4 pb-8 last:pb-0">
              {/* Timeline Column */}
              <div className="flex flex-col items-center shrink-0">
                {/* Year Badge */}
                <div className={`w-11 h-11 rounded-full border flex items-center justify-center text-xs font-bold z-10 ${accentClass}`}>
                  {group.year}
                </div>
                {/* Timeline Line */}
                {groupIndex < data.memories.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gradient-to-b from-dark-border to-transparent mt-2" />
                )}
              </div>

              {/* Content Column */}
              <div className="flex-1 pt-0.5 min-w-0">
                {/* Year Label */}
                <div className="mb-3">
                  <h2 className="text-lg font-bold text-white">
                    {group.yearsAgo === 1 ? '1 Year Ago' : `${group.yearsAgo} Years Ago`}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(group.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {group.items.map((item, itemIndex) => (
                    <TimelineCard
                      key={item.id}
                      item={item}
                      index={groupIndex + itemIndex}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center py-4 border-t border-dark-border">
        <p className="text-xs text-gray-600">
          Memories are shared from you and your friends
        </p>
      </div>
    </div>
  );
};

export default OnThisDayPage;

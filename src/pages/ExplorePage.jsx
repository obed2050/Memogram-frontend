import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  HiPlay, HiHeart, HiChatBubbleLeft, HiUserGroup, HiHashtag,
  HiAcademicCap, HiSparkles, HiChevronRight, HiChevronLeft,
} from 'react-icons/hi2';
import { exploreService } from '../services';
import Avatar from '../components/ui/Avatar';
import { formatNumber } from '../utils';
import toast from 'react-hot-toast';

const REEL_GRADIENTS = [
  'from-purple-600/80 via-fuchsia-500/40 to-transparent',
  'from-blue-600/80 via-cyan-500/40 to-transparent',
  'from-rose-600/80 via-pink-500/40 to-transparent',
  'from-emerald-600/80 via-teal-500/40 to-transparent',
  'from-amber-600/80 via-orange-500/40 to-transparent',
];

const SCHOOL_SIZES = ['text-2xl w-20 h-20', 'text-xl w-16 h-16', 'text-lg w-14 h-14'];

const RANK_COLORS = [
  'from-amber-400 to-yellow-500',
  'from-gray-300 to-gray-400',
  'from-amber-600 to-orange-700',
];

function ScrollRail({ children, className = '' }) {
  const ref = useRef(null);
  const scroll = (dir) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };
  return (
    <div className={`relative group ${className}`}>
      <button
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-dark-card/90 border border-dark-border flex items-center justify-center text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <HiChevronLeft className="w-4 h-4" />
      </button>
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {children}
      </div>
      <button
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-dark-card/90 border border-dark-border flex items-center justify-center text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <HiChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function ReelCard({ reel, index }) {
  const gradient = REEL_GRADIENTS[index % REEL_GRADIENTS.length];
  const thumb = reel.videos?.[0] || reel.images?.[0];
  return (
    <Link
      to={`/post/${reel.id}`}
      className="snap-start shrink-0 w-40 h-64 rounded-2xl overflow-hidden relative group cursor-pointer"
    >
      {thumb ? (
        reel.videos?.length > 0 ? (
          <video src={thumb} className="absolute inset-0 w-full h-full object-cover" preload="metadata" />
        ) : (
          <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )
      ) : (
        <div className="absolute inset-0 bg-dark-card" />
      )}
      <div className={`absolute inset-0 bg-gradient-to-t ${gradient}`} />
      <div className="absolute inset-0 flex flex-col justify-end p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <HiPlay className="w-3.5 h-3.5 text-white fill-current" />
          <span className="text-white text-xs font-bold">{formatNumber(reel.likesCount + (reel.commentsCount || 0))}</span>
        </div>
        <p className="text-white text-xs font-medium line-clamp-2 leading-tight">{reel.content}</p>
        <p className="text-white/60 text-[10px] mt-1">@{reel.author?.username}</p>
      </div>
    </Link>
  );
}

function MemoryCard({ memory, tall }) {
  const img = memory.images?.[0];
  return (
    <Link
      to={`/post/${memory.id}`}
      className={`block rounded-2xl overflow-hidden relative group bg-dark-card border border-dark-border ${
        tall ? 'h-64' : 'h-44'
      }`}
    >
      {img ? (
        <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full p-4 flex items-end">
          <p className="text-gray-300 text-sm line-clamp-4">{memory.content}</p>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
        <div className="flex items-center gap-2">
          <Avatar src={memory.author?.profilePhoto} name={memory.author?.fullName} size="xs" />
          <span className="text-white text-xs font-medium truncate">{memory.author?.fullName}</span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-white/70 text-[10px]">
            <HiHeart className="w-3 h-3" /> {memory.likesCount || 0}
          </span>
          <span className="flex items-center gap-1 text-white/70 text-[10px]">
            <HiChatBubbleLeft className="w-3 h-3" /> {memory.commentsCount || 0}
          </span>
        </div>
      </div>
    </Link>
  );
}

function SchoolOrb({ school, index, total }) {
  const sizeClass = SCHOOL_SIZES[index % 3];
  const offset = index % 2 === 0 ? 'translate-y-2' : '-translate-y-2';
  return (
    <Link
      to={`/communities/${school.id}`}
      className={`shrink-0 flex flex-col items-center gap-2 group ${offset}`}
    >
      <div
        className={`${sizeClass} rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/20 flex items-center justify-center font-bold text-primary-light group-hover:scale-110 group-hover:border-primary/40 transition-all`}
      >
        {school.initial}
      </div>
      <div className="text-center max-w-[80px]">
        <p className="text-[11px] text-gray-300 font-medium truncate">{school.name}</p>
        <p className="text-[10px] text-gray-500">{formatNumber(school.memberCount)} members</p>
      </div>
    </Link>
  );
}

function UserRankCard({ user, rank }) {
  const isTop3 = rank < 3;
  return (
    <Link
      to={`/profile/${user.id}`}
      className="shrink-0 w-48 snap-start bg-dark-card border border-dark-border rounded-2xl p-4 hover:border-primary/20 transition-colors group"
    >
      <div className="relative mb-3 flex justify-center">
        <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-dark ${
          isTop3
            ? `bg-gradient-to-br ${RANK_COLORS[rank]}`
            : 'bg-dark-surface border border-dark-border text-gray-400'
        }`}>
          {rank + 1}
        </div>
        <div className={`rounded-full p-0.5 ${isTop3 ? 'bg-gradient-to-br from-primary to-accent' : 'bg-dark-surface'}`}>
          <Avatar src={user.profilePhoto} name={user.fullName} size="lg" />
        </div>
      </div>
      <p className="text-sm font-semibold text-white text-center truncate">{user.fullName}</p>
      <p className="text-[11px] text-gray-500 text-center">@{user.username}</p>
      <p className="text-[10px] text-gray-600 text-center mt-1">{formatNumber(user.followerCount)} followers</p>
    </Link>
  );
}

function HashtagPill({ tag, maxEngagement }) {
  const ratio = maxEngagement > 0 ? tag.engagement / maxEngagement : 0;
  const size = ratio > 0.7 ? 'text-base px-5 py-2.5' : ratio > 0.3 ? 'text-sm px-4 py-2' : 'text-xs px-3 py-1.5';
  return (
    <Link
      to={`/search`}
      className={`inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary-light font-medium hover:bg-primary/10 hover:border-primary/30 transition-all ${size}`}
    >
      <HiHashtag className="w-3.5 h-3.5 opacity-60" />
      {tag.tag.replace('#', '')}
      <span className="text-[10px] text-gray-500 ml-0.5">{tag.count}</span>
    </Link>
  );
}

const SECTION_ACCENTS = {
  reels: { bg: 'bg-rose-500/10', text: 'text-rose-400' },
  memories: { bg: 'bg-primary/10', text: 'text-primary' },
  schools: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  users: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  hashtags: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
};

function SectionHeader({ icon: Icon, label, accentKey = 'reels' }) {
  const accent = SECTION_ACCENTS[accentKey];
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-8 h-8 rounded-lg ${accent.bg} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${accent.text}`} />
      </div>
      <h2 className="text-lg font-bold text-white tracking-tight">{label}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-dark-border to-transparent" />
    </div>
  );
}

const ExplorePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExplore = async () => {
      try {
        const res = await exploreService.getExplore();
        setData(res.data);
      } catch {
        toast.error('Failed to load explore');
      } finally {
        setLoading(false);
      }
    };
    fetchExplore();
  }, []);

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="h-20 rounded-2xl bg-dark-card" />
        <div className="h-40 rounded-2xl bg-dark-card" />
        <div className="h-56 rounded-2xl bg-dark-card" />
        <div className="h-32 rounded-2xl bg-dark-card" />
      </div>
    );
  }

  if (!data) return null;

  const maxHashtagEngagement = data.trendingHashtags[0]?.engagement || 1;

  return (
    <div className="space-y-12 pb-20">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-dark-card to-accent/10 border border-primary/10 p-8 text-center">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-40 h-40 bg-primary rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-accent rounded-full blur-[80px]" />
        </div>
        <div className="relative">
          <HiSparkles className="w-6 h-6 text-primary mx-auto mb-2" />
          <h1 className="text-3xl font-black text-white tracking-tight">Discover</h1>
          <p className="text-gray-400 text-sm mt-1">What the community is talking about right now</p>
        </div>
      </div>

      {/* Trending Reels */}
      {data.trendingReels.length > 0 && (
        <section>
          <SectionHeader icon={HiPlay} label="Trending Reels" accentKey="reels" />
          <ScrollRail>
            {data.trendingReels.map((reel, i) => (
              <ReelCard key={reel.id} reel={reel} index={i} />
            ))}
          </ScrollRail>
        </section>
      )}

      {/* Popular Memories — Masonry */}
      {data.popularMemories.length > 0 && (
        <section>
          <SectionHeader icon={HiHeart} label="Popular Memories" accentKey="memories" />
          <div className="grid grid-cols-2 gap-3">
            {data.popularMemories.map((mem, i) => (
              <MemoryCard key={mem.id} memory={mem} tall={i % 3 === 0} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Schools — Orbital */}
      {data.trendingSchools.length > 0 && (
        <section>
          <SectionHeader icon={HiAcademicCap} label="Trending Schools" accentKey="schools" />
          <ScrollRail className="py-4">
            {data.trendingSchools.map((school, i) => (
              <SchoolOrb key={school.id} school={school} index={i} total={data.trendingSchools.length} />
            ))}
          </ScrollRail>
        </section>
      )}

      {/* Popular Users — Rank Cards */}
      {data.popularUsers.length > 0 && (
        <section>
          <SectionHeader icon={HiUserGroup} label="Popular Users" accentKey="users" />
          <ScrollRail>
            {data.popularUsers.map((user, i) => (
              <UserRankCard key={user.id} user={user} rank={i} />
            ))}
          </ScrollRail>
        </section>
      )}

      {/* Trending Hashtags — Tag Cloud */}
      {data.trendingHashtags.length > 0 && (
        <section>
          <SectionHeader icon={HiHashtag} label="Trending Hashtags" accentKey="hashtags" />
          <div className="flex flex-wrap gap-2.5">
            {data.trendingHashtags.map((tag) => (
              <HashtagPill key={tag.tag} tag={tag} maxEngagement={maxHashtagEngagement} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {data.trendingReels.length === 0 && data.popularMemories.length === 0 && (
        <div className="text-center py-20">
          <HiSparkles className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Nothing trending yet</p>
          <p className="text-gray-600 text-sm mt-1">Be the first to post something</p>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;

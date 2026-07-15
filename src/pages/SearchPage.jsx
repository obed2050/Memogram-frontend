import { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiMagnifyingGlass, HiUserGroup, HiAcademicCap, HiCalendarDays,
  HiUserCircle, HiFilm, HiHeart, HiChatBubbleLeft,
  HiMapPin, HiClock, HiFunnel,
} from 'react-icons/hi2';
import { searchService } from '../services';
import Avatar from '../components/ui/Avatar';
import { formatNumber, cn } from '../utils';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'users', label: 'People' },
  { key: 'schools', label: 'Schools' },
  { key: 'communities', label: 'Communities' },
  { key: 'events', label: 'Events' },
  { key: 'clubs', label: 'Clubs' },
  { key: 'reels', label: 'Reels' },
  { key: 'memories', label: 'Memories' },
];

const TYPE_ICONS = {
  users: HiUserCircle,
  schools: HiAcademicCap,
  communities: HiUserGroup,
  events: HiCalendarDays,
  clubs: HiUserGroup,
  reels: HiFilm,
  memories: HiHeart,
};

// --- Result Cards ---

function UserCard({ user }) {
  return (
    <Link
      to={`/profile/${user.id}`}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-card border border-transparent hover:border-dark-border transition-all group"
    >
      <Avatar src={user.profilePhoto} name={user.fullName} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm truncate group-hover:text-primary-light transition-colors">{user.fullName}</p>
        <p className="text-xs text-gray-500 truncate">@{user.username}</p>
        {user.bio && <p className="text-xs text-gray-600 truncate mt-0.5">{user.bio}</p>}
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-gray-500">{formatNumber(user.followerCount)} followers</p>
        {user.isFollowing && (
          <span className="text-[10px] text-primary font-medium">Following</span>
        )}
      </div>
    </Link>
  );
}

function SchoolCard({ school }) {
  return (
    <Link
      to={`/communities/${school.id}`}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-card border border-transparent hover:border-dark-border transition-all group"
    >
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 group-hover:from-primary/30 group-hover:to-accent/30 transition-all">
        <span className="text-base font-bold text-primary-light">{school.name?.[0]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm truncate group-hover:text-primary-light transition-colors">{school.name}</p>
        {school.location && (
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <HiMapPin className="w-3 h-3" />{school.location}
          </p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-gray-500">{formatNumber(school.memberCount)} members</p>
      </div>
    </Link>
  );
}

function CommunityCard({ community }) {
  return (
    <Link
      to={`/communities/${community.schoolId}`}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-card border border-transparent hover:border-dark-border transition-all group"
    >
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center shrink-0">
        <HiUserGroup className="w-5 h-5 text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm truncate group-hover:text-primary-light transition-colors">
          {community.school?.name || 'Community'}
        </p>
        {community.description && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{community.description}</p>
        )}
      </div>
      <span className="text-[10px] text-gray-600 shrink-0">{formatNumber(community.memberCount)} members</span>
    </Link>
  );
}

function EventCard({ event }) {
  const isPast = new Date(event.eventDate) < new Date();
  return (
    <Link
      to={`/events/${event.id}`}
      className="block p-3 rounded-xl hover:bg-dark-card border border-transparent hover:border-dark-border transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
          isPast ? 'bg-gray-500/10' : 'bg-emerald-500/10'
        )}>
          <HiCalendarDays className={cn('w-5 h-5', isPast ? 'text-gray-500' : 'text-emerald-400')} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate group-hover:text-primary-light transition-colors">{event.title}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <HiClock className="w-3 h-3" />
              {new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            {event.location && (
              <span className="flex items-center gap-1 truncate">
                <HiMapPin className="w-3 h-3" />
                {event.location}
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className={cn(
            'text-[10px] px-2 py-0.5 rounded-full font-medium',
            isPast ? 'bg-gray-500/10 text-gray-500' : 'bg-emerald-500/10 text-emerald-400'
          )}>
            {isPast ? 'Past' : 'Upcoming'}
          </span>
        </div>
      </div>
    </Link>
  );
}

function ClubCard({ club }) {
  return (
    <Link
      to={`/clubs/${club.id}`}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-card border border-transparent hover:border-dark-border transition-all group"
    >
      {club.coverImage ? (
        <img src={club.coverImage} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0" />
      ) : (
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center shrink-0">
          <HiUserGroup className="w-5 h-5 text-purple-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm truncate group-hover:text-primary-light transition-colors">{club.name}</p>
        <p className="text-xs text-gray-500 truncate">{club.school?.name}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-gray-500">{formatNumber(club.memberCount)} members</p>
      </div>
    </Link>
  );
}

function ReelCard({ reel }) {
  const thumb = reel.videos?.[0] || reel.images?.[0];
  return (
    <Link
      to={`/post/${reel.id}`}
      className="block rounded-xl overflow-hidden relative group bg-dark-card border border-dark-border hover:border-primary/20 transition-all"
    >
      <div className="aspect-[9/16] max-h-52 relative">
        {thumb ? (
          reel.videos?.length > 0 ? (
            <video src={thumb} className="w-full h-full object-cover" preload="metadata" />
          ) : (
            <img src={thumb} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-dark-surface">
            <HiFilm className="w-8 h-8 text-gray-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-white text-xs line-clamp-2 font-medium">{reel.content}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-white/70 text-[10px]">
              <HiHeart className="w-3 h-3" /> {formatNumber(reel.likesCount)}
            </span>
            <span className="flex items-center gap-1 text-white/70 text-[10px]">
              <HiChatBubbleLeft className="w-3 h-3" /> {reel.commentsCount || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function MemoryCard({ memory }) {
  const img = memory.images?.[0];
  return (
    <Link
      to={`/post/${memory.id}`}
      className="block rounded-xl overflow-hidden relative group bg-dark-card border border-dark-border hover:border-primary/20 transition-all"
    >
      <div className="aspect-square max-h-52 relative">
        {img ? (
          <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full p-4 flex items-end">
            <p className="text-gray-300 text-xs line-clamp-3">{memory.content}</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <div className="flex items-center gap-2">
            <Avatar src={memory.author?.profilePhoto} name={memory.author?.fullName} size="xs" />
            <span className="text-white text-[11px] font-medium truncate">{memory.author?.fullName}</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-white/70 text-[10px]">
              <HiHeart className="w-3 h-3" /> {formatNumber(memory.likesCount)}
            </span>
            <span className="flex items-center gap-1 text-white/70 text-[10px]">
              <HiChatBubbleLeft className="w-3 h-3" /> {memory.commentsCount || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// --- Section Headers for "All" tab ---

function ResultSection({ icon: Icon, label, items, renderItem, viewAllLink, accent }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${accent}`} />
          <h3 className="text-sm font-semibold text-gray-300">{label}</h3>
        </div>
        {viewAllLink && (
          <Link to={viewAllLink} className="text-xs text-primary hover:text-primary-light transition-colors">
            View all
          </Link>
        )}
      </div>
      <div className="bg-dark-card/50 rounded-xl border border-dark-border divide-y divide-dark-border">
        {items.map((item, i) => renderItem(item, i))}
      </div>
    </div>
  );
}

// --- Main Search Page ---

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(1);
  const inputRef = useRef(null);
  const observerRef = useRef(null);

  const doSearch = useCallback(async (searchQuery, type = 'all', pageNum = 1, append = false) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await searchService.search({ q: searchQuery, type, page: pageNum, limit: 20 });
      const data = res.data;

      if (type === 'all') {
        setResults(data.results || {});
        setHasMore(false);
      } else {
        const items = data.items || [];
        if (append) {
          setResults((prev) => ({ ...prev, [type]: [...(prev[type] || []), ...items] }));
        } else {
          setResults({ [type]: items });
        }
        setHasMore(items.length >= 20);
      }
    } catch {
      toast.error('Search failed');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    pageRef.current = 1;
    setHasMore(true);
    doSearch(query, activeTab, 1, false);
  }, [query, activeTab, doSearch]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    pageRef.current = 1;
    setHasMore(true);
    if (query.trim()) {
      doSearch(query, tab, 1, false);
    }
  }, [query, doSearch]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || activeTab === 'all') return;
    setLoadingMore(true);
    pageRef.current += 1;
    doSearch(query, activeTab, pageRef.current, true);
  }, [query, activeTab, loadingMore, hasMore, doSearch]);

  // Infinite scroll observer
  useEffect(() => {
    if (activeTab === 'all') return;
    const node = observerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [activeTab, loadMore]);

  const resultCount = activeTab === 'all'
    ? Object.values(results).reduce((sum, arr) => sum + (arr?.length || 0), 0)
    : (results[activeTab]?.length || 0);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Search Bar */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-4">Search</h1>
        <form onSubmit={handleSubmit} className="relative">
          <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people, schools, events, clubs..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-dark-card border border-dark-border text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            autoFocus
          />
        </form>
      </div>

      {/* Tabs */}
      <div className="relative">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
          {TABS.map((tab) => {
            const Icon = TYPE_ICONS[tab.key] || HiFunnel;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0',
                  activeTab === tab.key
                    ? 'bg-primary/15 text-primary-light border border-primary/20'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-dark-card border border-transparent'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Results */}
      {!loading && searched && (
        <>
          {activeTab === 'all' ? (
            <div className="space-y-6">
              <ResultSection
                icon={HiUserCircle}
                label="People"
                items={results.users}
                accent="text-emerald-400"
                renderItem={(u) => <UserCard key={u.id} user={u} />}
              />
              <ResultSection
                icon={HiAcademicCap}
                label="Schools"
                items={results.schools}
                accent="text-blue-400"
                renderItem={(s) => <SchoolCard key={s.id} school={s} />}
              />
              <ResultSection
                icon={HiUserGroup}
                label="Communities"
                items={results.communities}
                accent="text-cyan-400"
                renderItem={(c) => <CommunityCard key={c.id} community={c} />}
              />
              <ResultSection
                icon={HiCalendarDays}
                label="Events"
                items={results.events}
                accent="text-emerald-400"
                renderItem={(e) => <EventCard key={e.id} event={e} />}
              />
              <ResultSection
                icon={HiUserGroup}
                label="Clubs"
                items={results.clubs}
                accent="text-purple-400"
                renderItem={(c) => <ClubCard key={c.id} club={c} />}
              />
              <ResultSection
                icon={HiFilm}
                label="Reels"
                items={results.reels}
                accent="text-rose-400"
                renderItem={(r) => <ReelCard key={r.id} reel={r} />}
              />
              <ResultSection
                icon={HiHeart}
                label="Memories"
                items={results.memories}
                accent="text-amber-400"
                renderItem={(m) => <MemoryCard key={m.id} memory={m} />}
              />
              {resultCount === 0 && (
                <p className="text-center text-gray-500 text-sm py-12">No results found</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {resultCount > 0 && (
                <p className="text-xs text-gray-600 mb-2">{resultCount} results</p>
              )}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-1"
                >
                  {activeTab === 'users' && results.users?.map((u) => <UserCard key={u.id} user={u} />)}
                  {activeTab === 'schools' && results.schools?.map((s) => <SchoolCard key={s.id} school={s} />)}
                  {activeTab === 'communities' && results.communities?.map((c) => <CommunityCard key={c.id} community={c} />)}
                  {activeTab === 'events' && results.events?.map((e) => <EventCard key={e.id} event={e} />)}
                  {activeTab === 'clubs' && results.clubs?.map((c) => <ClubCard key={c.id} club={c} />)}
                  {activeTab === 'reels' && (
                    <div className="grid grid-cols-3 gap-2">
                      {results.reels?.map((r) => <ReelCard key={r.id} reel={r} />)}
                    </div>
                  )}
                  {activeTab === 'memories' && (
                    <div className="grid grid-cols-3 gap-2">
                      {results.memories?.map((m) => <MemoryCard key={m.id} memory={m} />)}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Infinite scroll sentinel */}
              {hasMore && activeTab !== 'all' && (
                <div ref={observerRef} className="flex justify-center py-4">
                  {loadingMore && (
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              )}

              {!hasMore && resultCount > 0 && (
                <p className="text-center text-gray-600 text-xs py-4">End of results</p>
              )}

              {resultCount === 0 && (
                <p className="text-center text-gray-500 text-sm py-12">No results found</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!loading && !searched && (
        <div className="text-center py-16">
          <HiMagnifyingGlass className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Search Memogram</p>
          <p className="text-gray-600 text-sm mt-1">Find people, schools, events, clubs, and more</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;

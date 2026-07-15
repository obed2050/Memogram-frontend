import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiMagnifyingGlass, HiUserGroup } from 'react-icons/hi2';
import { communityService } from '../services';
import CommunityCard from '../components/community/CommunityCard';
import Button from '../components/ui/Button';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import toast from 'react-hot-toast';

const CommunitiesPage = () => {
  const [tab, setTab] = useState('my');
  const [myCommunities, setMyCommunities] = useState([]);
  const [browseCommunities, setBrowseCommunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchMy = async () => {
      try {
        const res = await communityService.getMyCommunities();
        setMyCommunities(res.data.communities);
      } catch {
        toast.error('Failed to load communities');
      } finally {
        setLoading(false);
      }
    };
    fetchMy();
  }, []);

  const fetchBrowse = useCallback(async (pageNum = 1, query = '') => {
    try {
      setBrowseLoading(true);
      const res = await communityService.browseCommunities({ page: pageNum, limit: 20, q: query || undefined });
      const newCommunities = res.data.data;
      if (pageNum === 1) {
        setBrowseCommunities(newCommunities);
      } else {
        setBrowseCommunities((prev) => [...prev, ...newCommunities]);
      }
      setHasMore(res.data.pagination.hasNext);
    } catch {
      toast.error('Failed to load communities');
    } finally {
      setBrowseLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'browse') {
      fetchBrowse(1, searchQuery);
    }
  }, [tab, fetchBrowse, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBrowse(1, searchQuery);
  };

  const fetchMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBrowse(nextPage, searchQuery);
  }, [page, searchQuery, fetchBrowse]);

  const lastRef = useInfiniteScroll(fetchMore, hasMore, browseLoading);

  const mySchools = myCommunities.filter((c) => c.isMember);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white mb-1">Communities</h1>
        <p className="text-gray-500 text-sm">Connect with your school communities</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-card rounded-xl p-1 border border-dark-border">
        <button
          onClick={() => setTab('my')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'my' ? 'bg-dark-surface text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          My Schools ({mySchools.length})
        </button>
        <button
          onClick={() => setTab('browse')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'browse' ? 'bg-dark-surface text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Browse All
        </button>
      </div>

      {/* My Communities */}
      {tab === 'my' && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-52 rounded-2xl" />
              ))}
            </div>
          ) : mySchools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mySchools.map((community) => (
                <CommunityCard key={community.schoolId} community={community} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <HiUserGroup className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-3">You haven't added any schools yet</p>
              <p className="text-gray-600 text-xs">Add schools to your profile to join their communities</p>
            </div>
          )}
        </div>
      )}

      {/* Browse Communities */}
      {tab === 'browse' && (
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search schools..."
              className="input-dark w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder-gray-500 text-sm"
            />
          </form>

          {browseLoading && browseCommunities.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-52 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {browseCommunities.map((community, index) => (
                <div key={community.schoolId} ref={index === browseCommunities.length - 1 ? lastRef : null}>
                  <CommunityCard community={community} />
                </div>
              ))}
            </div>
          )}

          {browseLoading && browseCommunities.length > 0 && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!browseLoading && browseCommunities.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-8">No communities found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunitiesPage;

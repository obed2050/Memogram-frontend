import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiUserGroup, HiPhoto, HiFilm, HiCalendarDays, HiInformationCircle, HiAcademicCap } from 'react-icons/hi2';
import { communityService, postService, memoryService } from '../services';
import CommunityHeader from '../components/community/CommunityHeader';
import CommunityMembers from '../components/community/CommunityMembers';
import CommunityEvents from '../components/community/CommunityEvents';
import GenerationCommunityCard from '../components/community/GenerationCommunityCard';
import PostCard from '../components/feed/PostCard';
import CreatePost from '../components/feed/CreatePost';
import { PostSkeleton } from '../components/ui/Skeleton';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'posts', label: 'Posts', icon: HiPhoto },
  { key: 'memories', label: 'Memories', icon: HiFilm },
  { key: 'members', label: 'Members', icon: HiUserGroup },
  { key: 'generations', label: 'Generations', icon: HiAcademicCap },
  { key: 'events', label: 'Events', icon: HiCalendarDays },
  { key: 'about', label: 'About', icon: HiInformationCircle },
];

const CommunityDetailPage = () => {
  const { schoolId } = useParams();
  const [community, setCommunity] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);

  const [posts, setPosts] = useState([]);
  const [postPage, setPostPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const [memories, setMemories] = useState([]);
  const [memoryPage, setMemoryPage] = useState(1);
  const [hasMoreMemories, setHasMoreMemories] = useState(true);

  const [generations, setGenerations] = useState([]);
  const [generationsLoading, setGenerationsLoading] = useState(false);

  const fetchCommunity = useCallback(async () => {
    try {
      const res = await communityService.getCommunityBySchool(schoolId);
      setCommunity(res.data.community);
    } catch {
      toast.error('Failed to load community');
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchCommunity();
  }, [fetchCommunity]);

  const fetchGenerations = useCallback(async () => {
    try {
      setGenerationsLoading(true);
      const res = await communityService.getMembers(schoolId, { page: 1, limit: 1000 });
      const members = res.data.data;
      const genMap = {};
      for (const m of members) {
        if (m.generation && !genMap[m.generation]) {
          genMap[m.generation] = {
            schoolId,
            schoolName: community?.schoolName,
            schoolLocation: community?.schoolLocation,
            schoolLogo: community?.schoolLogo,
            generation: m.generation,
            memberCount: 0,
          };
        }
        if (m.generation) {
          genMap[m.generation].memberCount++;
        }
      }
      setGenerations(Object.values(genMap));
    } catch {
      toast.error('Failed to load generations');
    } finally {
      setGenerationsLoading(false);
    }
  }, [schoolId, community]);

  const fetchPosts = useCallback(async (pageNum = 1) => {
    try {
      setContentLoading(true);
      const res = await communityService.getPosts(schoolId, { page: pageNum, limit: 20 });
      if (pageNum === 1) {
        setPosts(res.data.data);
      } else {
        setPosts((prev) => [...prev, ...res.data.data]);
      }
      setHasMorePosts(res.data.pagination.hasNext);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setContentLoading(false);
    }
  }, [schoolId]);

  const fetchMemories = useCallback(async (pageNum = 1) => {
    try {
      setContentLoading(true);
      const res = await communityService.getMemories(schoolId, { page: pageNum, limit: 20 });
      if (pageNum === 1) {
        setMemories(res.data.data);
      } else {
        setMemories((prev) => [...prev, ...res.data.data]);
      }
      setHasMoreMemories(res.data.pagination.hasNext);
    } catch {
      toast.error('Failed to load memories');
    } finally {
      setContentLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    if (activeTab === 'posts') fetchPosts(1);
    if (activeTab === 'memories') fetchMemories(1);
    if (activeTab === 'generations') fetchGenerations();
  }, [activeTab, fetchPosts, fetchMemories]);

  const fetchMorePosts = useCallback(() => {
    const nextPage = postPage + 1;
    setPostPage(nextPage);
    fetchPosts(nextPage);
  }, [postPage, fetchPosts]);

  const fetchMoreMemories = useCallback(() => {
    const nextPage = memoryPage + 1;
    setMemoryPage(nextPage);
    fetchMemories(nextPage);
  }, [memoryPage, fetchMemories]);

  const lastPostRef = useInfiniteScroll(fetchMorePosts, hasMorePosts, contentLoading);
  const lastMemoryRef = useInfiniteScroll(fetchMoreMemories, hasMoreMemories, contentLoading);

  const handlePostCreated = () => {
    setPostPage(1);
    fetchPosts(1);
  };

  const handleDeletePost = async (postId) => {
    try {
      await postService.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const handleBannerUpdated = () => {
    fetchCommunity();
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="skeleton h-52 rounded-2xl" />
        <div className="skeleton h-12 rounded-xl" />
        <PostSkeleton />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Community not found</p>
        <Link to="/communities" className="text-primary-light text-sm mt-2 inline-block">Back to communities</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Back Button */}
      <Link to="/communities" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
        <HiArrowLeft className="w-4 h-4" />
        Communities
      </Link>

      {/* Header */}
      <CommunityHeader community={community} onBannerUpdated={handleBannerUpdated} />

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-card rounded-xl p-1 border border-dark-border overflow-x-auto hide-scrollbar">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === key
                ? 'bg-dark-surface text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {community.isMember && <CreatePost onPostCreated={handlePostCreated} />}
            {contentLoading && posts.length === 0 ? (
              <div className="space-y-4">
                {[1, 2].map((i) => <PostSkeleton key={i} />)}
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post, index) => (
                  <div key={post.id} ref={index === posts.length - 1 ? lastPostRef : null}>
                    <PostCard post={post} onDelete={handleDeletePost} />
                  </div>
                ))}
                {contentLoading && (
                  <div className="space-y-4">
                    {[1].map((i) => <PostSkeleton key={`loading-${i}`} />)}
                  </div>
                )}
                {!hasMorePosts && posts.length > 0 && (
                  <p className="text-center text-gray-600 text-xs py-2">All posts loaded</p>
                )}
                {!contentLoading && posts.length === 0 && (
                  <p className="text-center text-gray-500 text-sm py-8">No posts in this community yet</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Memories Tab */}
        {activeTab === 'memories' && (
          <div className="space-y-4">
            {contentLoading && memories.length === 0 ? (
              <div className="space-y-4">
                {[1, 2].map((i) => <PostSkeleton key={i} />)}
              </div>
            ) : (
              <div className="space-y-4">
                {memories.map((memory, index) => (
                  <div key={memory.id} ref={index === memories.length - 1 ? lastMemoryRef : null}>
                    <PostCard post={{ ...memory, type: 'memory' }} />
                  </div>
                ))}
                {contentLoading && (
                  <div className="space-y-4">
                    {[1].map((i) => <PostSkeleton key={`loading-${i}`} />)}
                  </div>
                )}
                {!hasMoreMemories && memories.length > 0 && (
                  <p className="text-center text-gray-600 text-xs py-2">All memories loaded</p>
                )}
                {!contentLoading && memories.length === 0 && (
                  <p className="text-center text-gray-500 text-sm py-8">No memories yet</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <CommunityMembers schoolId={schoolId} />
        )}

        {/* Generations Tab */}
        {activeTab === 'generations' && (
          <div className="space-y-4">
            {generationsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="skeleton h-28 rounded-2xl" />
                ))}
              </div>
            ) : generations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {generations.map((gen) => (
                  <GenerationCommunityCard key={gen.generation} generation={gen} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <HiAcademicCap className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No generations found</p>
                <p className="text-gray-600 text-xs">Members need to add generation info to their school history</p>
              </div>
            )}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <CommunityEvents schoolId={schoolId} isMember={community.isMember} />
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="bg-dark-card rounded-2xl border border-dark-border p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">About {community.schoolName}</h3>
              {community.description ? (
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{community.description}</p>
              ) : (
                <p className="text-sm text-gray-500">No description yet</p>
              )}
            </div>

            {community.rules && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Community Rules</h3>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{community.rules}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Members</h3>
              <p className="text-sm text-gray-300">{community.memberCount} members</p>
            </div>

            {community.schoolLocation && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Location</h3>
                <p className="text-sm text-gray-300">{community.schoolLocation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityDetailPage;

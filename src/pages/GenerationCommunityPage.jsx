import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiArrowLeft, HiUserGroup, HiPhoto, HiFilm, HiChatBubbleLeftRight, HiInformationCircle, HiAcademicCap } from 'react-icons/hi2';
import { generationService, postService } from '../services';
import CommunityMembers from '../components/community/CommunityMembers';
import GenerationDiscussions from '../components/community/GenerationDiscussions';
import PostCard from '../components/feed/PostCard';
import CreatePost from '../components/feed/CreatePost';
import { PostSkeleton } from '../components/ui/Skeleton';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'posts', label: 'Posts', icon: HiPhoto },
  { key: 'memories', label: 'Memories', icon: HiFilm },
  { key: 'members', label: 'Members', icon: HiUserGroup },
  { key: 'discussions', label: 'Discussions', icon: HiChatBubbleLeftRight },
  { key: 'about', label: 'About', icon: HiInformationCircle },
];

const GenerationCommunityPage = () => {
  const { schoolId, generation: rawGeneration } = useParams();
  const generation = decodeURIComponent(rawGeneration);

  const [genData, setGenData] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);

  const [posts, setPosts] = useState([]);
  const [postPage, setPostPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const [memories, setMemories] = useState([]);
  const [memoryPage, setMemoryPage] = useState(1);
  const [hasMoreMemories, setHasMoreMemories] = useState(true);

  const fetchGeneration = useCallback(async () => {
    try {
      const res = await generationService.getGeneration(schoolId, generation);
      setGenData(res.data.generation);
    } catch {
      toast.error('Failed to load generation');
    } finally {
      setLoading(false);
    }
  }, [schoolId, generation]);

  useEffect(() => {
    fetchGeneration();
  }, [fetchGeneration]);

  const fetchPosts = useCallback(async (pageNum = 1) => {
    try {
      setContentLoading(true);
      const res = await generationService.getPosts(schoolId, generation, { page: pageNum, limit: 20 });
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
  }, [schoolId, generation]);

  const fetchMemories = useCallback(async (pageNum = 1) => {
    try {
      setContentLoading(true);
      const res = await generationService.getMemories(schoolId, generation, { page: pageNum, limit: 20 });
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
  }, [schoolId, generation]);

  useEffect(() => {
    if (activeTab === 'posts') fetchPosts(1);
    if (activeTab === 'memories') fetchMemories(1);
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

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="skeleton h-52 rounded-2xl" />
        <div className="skeleton h-12 rounded-xl" />
        <PostSkeleton />
      </div>
    );
  }

  if (!genData) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Generation not found</p>
        <Link to={`/communities/${schoolId}`} className="text-primary-light text-sm mt-2 inline-block">Back to community</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <Link to={`/communities/${schoolId}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
        <HiArrowLeft className="w-4 h-4" />
        {genData.schoolName}
      </Link>

      {/* Generation Header */}
      <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/20 to-accent/20 relative">
          {genData.schoolLogo && (
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <img src={genData.schoolLogo} alt="" className="h-full object-contain" />
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3 -mt-10 mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center border-4 border-dark-card shrink-0">
              <HiAcademicCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{genData.schoolName}</h1>
              <p className="text-sm text-primary-light font-medium">Generation {genData.generation}</p>
            </div>
          </div>
          <div className="flex gap-4 text-xs text-gray-400">
            <span>{genData.memberCount} members</span>
            <span>{genData.postCount} posts</span>
            <span>{genData.memoryCount} memories</span>
          </div>
        </div>
      </div>

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
            {genData.isMember && <CreatePost onPostCreated={handlePostCreated} />}
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
                  <p className="text-center text-gray-500 text-sm py-8">No posts in this generation yet</p>
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
          <CommunityMembers schoolId={schoolId} generation={generation} />
        )}

        {/* Discussions Tab */}
        {activeTab === 'discussions' && (
          <GenerationDiscussions schoolId={schoolId} generation={generation} />
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="bg-dark-card rounded-2xl border border-dark-border p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Generation {genData.generation}</h3>
              <p className="text-sm text-gray-300">
                This is the home for {genData.schoolName} students and alumni from the {genData.generation} generation.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Members</h3>
              <p className="text-sm text-gray-300">{genData.memberCount} members in this generation</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Content</h3>
              <p className="text-sm text-gray-300">{genData.postCount} posts &middot; {genData.memoryCount} memories</p>
            </div>

            {genData.schoolLocation && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">School Location</h3>
                <p className="text-sm text-gray-300">{genData.schoolLocation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerationCommunityPage;

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  HiArrowLeft, HiUserGroup, HiPhoto, HiFilm, HiCalendarDays, HiInformationCircle,
  HiChatBubbleLeft,
} from 'react-icons/hi2';
import { clubService, postService } from '../services';
import ClubHeader from '../components/clubs/ClubHeader';
import ClubMembers from '../components/clubs/ClubMembers';
import CommunityEvents from '../components/community/CommunityEvents';
import PostCard from '../components/feed/PostCard';
import CreatePost from '../components/feed/CreatePost';
import { PostSkeleton } from '../components/ui/Skeleton';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'feed', label: 'Feed', icon: HiChatBubbleLeft },
  { key: 'photos', label: 'Photos', icon: HiPhoto },
  { key: 'videos', label: 'Videos', icon: HiFilm },
  { key: 'members', label: 'Members', icon: HiUserGroup },
  { key: 'events', label: 'Events', icon: HiCalendarDays },
  { key: 'about', label: 'About', icon: HiInformationCircle },
];

const ClubDetailPage = () => {
  const { clubId } = useParams();
  const [club, setClub] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);

  const [feed, setFeed] = useState([]);
  const [feedPage, setFeedPage] = useState(1);
  const [hasMoreFeed, setHasMoreFeed] = useState(true);

  const [photos, setPhotos] = useState([]);
  const [photoPage, setPhotoPage] = useState(1);
  const [hasMorePhotos, setHasMorePhotos] = useState(true);

  const [videos, setVideos] = useState([]);
  const [videoPage, setVideoPage] = useState(1);
  const [hasMoreVideos, setHasMoreVideos] = useState(true);

  const fetchClub = useCallback(async () => {
    try {
      const res = await clubService.getClub(clubId);
      setClub(res.data.club);
    } catch {
      toast.error('Failed to load club');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchClub();
  }, [fetchClub]);

  const fetchFeed = useCallback(async (pageNum = 1) => {
    try {
      setContentLoading(true);
      const res = await clubService.getFeed(clubId, { page: pageNum, limit: 20 });
      if (pageNum === 1) setFeed(res.data.data);
      else setFeed((prev) => [...prev, ...res.data.data]);
      setHasMoreFeed(res.data.pagination.hasNext);
    } catch {
      toast.error('Failed to load feed');
    } finally {
      setContentLoading(false);
    }
  }, [clubId]);

  const fetchPhotos = useCallback(async (pageNum = 1) => {
    try {
      setContentLoading(true);
      const res = await clubService.getPhotos(clubId, { page: pageNum, limit: 20 });
      if (pageNum === 1) setPhotos(res.data.data);
      else setPhotos((prev) => [...prev, ...res.data.data]);
      setHasMorePhotos(res.data.pagination.hasNext);
    } catch {
      toast.error('Failed to load photos');
    } finally {
      setContentLoading(false);
    }
  }, [clubId]);

  const fetchVideos = useCallback(async (pageNum = 1) => {
    try {
      setContentLoading(true);
      const res = await clubService.getVideos(clubId, { page: pageNum, limit: 20 });
      if (pageNum === 1) setVideos(res.data.data);
      else setVideos((prev) => [...prev, ...res.data.data]);
      setHasMoreVideos(res.data.pagination.hasNext);
    } catch {
      toast.error('Failed to load videos');
    } finally {
      setContentLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    if (activeTab === 'feed') fetchFeed(1);
    if (activeTab === 'photos') fetchPhotos(1);
    if (activeTab === 'videos') fetchVideos(1);
  }, [activeTab, fetchFeed, fetchPhotos, fetchVideos]);

  const fetchMoreFeed = useCallback(() => {
    const next = feedPage + 1;
    setFeedPage(next);
    fetchFeed(next);
  }, [feedPage, fetchFeed]);

  const fetchMorePhotos = useCallback(() => {
    const next = photoPage + 1;
    setPhotoPage(next);
    fetchPhotos(next);
  }, [photoPage, fetchPhotos]);

  const fetchMoreVideos = useCallback(() => {
    const next = videoPage + 1;
    setVideoPage(next);
    fetchVideos(next);
  }, [videoPage, fetchVideos]);

  const lastFeedRef = useInfiniteScroll(fetchMoreFeed, hasMoreFeed, contentLoading);
  const lastPhotoRef = useInfiniteScroll(fetchMorePhotos, hasMorePhotos, contentLoading);
  const lastVideoRef = useInfiniteScroll(fetchMoreVideos, hasMoreVideos, contentLoading);

  const handlePostCreated = () => {
    setFeedPage(1);
    fetchFeed(1);
  };

  const handleDeletePost = async (postId) => {
    try {
      await postService.deletePost(postId);
      setFeed((prev) => prev.filter((p) => p.id !== postId));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const handleJoinLeave = async () => {
    try {
      const res = await clubService.toggleMembership(clubId);
      setClub((prev) => ({
        ...prev,
        isMember: res.data.isMember,
        memberRole: res.data.role,
        memberCount: prev.memberCount + (res.data.isMember ? 1 : -1),
      }));
      toast.success(res.data.isMember ? 'Joined the club' : 'Left the club');
    } catch {
      toast.error('Failed to update membership');
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

  if (!club) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Club not found</p>
        <Link to="/clubs" className="text-primary-light text-sm mt-2 inline-block">Back to clubs</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <Link to="/clubs" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
        <HiArrowLeft className="w-4 h-4" />
        Clubs
      </Link>

      {/* Header */}
      <ClubHeader club={club} onUpdated={fetchClub} />

      {/* Join/Leave Button */}
      <div className="flex gap-2">
        <button
          onClick={handleJoinLeave}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            club.isMember
              ? 'bg-dark-card border border-dark-border text-gray-300 hover:bg-dark-surface hover:text-white'
              : 'bg-primary text-white hover:bg-primary/80'
          }`}
        >
          {club.isMember ? (club.memberRole === 'owner' ? 'Owner' : 'Joined') : 'Join Club'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-card rounded-xl p-1 border border-dark-border overflow-x-auto hide-scrollbar">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === key ? 'bg-dark-surface text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {/* Feed Tab */}
        {activeTab === 'feed' && (
          <div className="space-y-4">
            {club.isMember && <CreatePost onPostCreated={handlePostCreated} clubId={clubId} />}
            {contentLoading && feed.length === 0 ? (
              <div className="space-y-4">
                {[1, 2].map((i) => <PostSkeleton key={i} />)}
              </div>
            ) : (
              <div className="space-y-4">
                {feed.map((post, index) => (
                  <div key={post.id} ref={index === feed.length - 1 ? lastFeedRef : null}>
                    <PostCard post={post} onDelete={handleDeletePost} />
                  </div>
                ))}
                {contentLoading && (
                  <div className="space-y-4">{[1].map((i) => <PostSkeleton key={`l-${i}`} />)}</div>
                )}
                {!hasMoreFeed && feed.length > 0 && (
                  <p className="text-center text-gray-600 text-xs py-2">All posts loaded</p>
                )}
                {!contentLoading && feed.length === 0 && (
                  <p className="text-center text-gray-500 text-sm py-8">No posts in this club yet</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div className="space-y-4">
            {contentLoading && photos.length === 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
              </div>
            ) : photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {photos.map((post, index) => (
                  <div key={post.id} ref={index === photos.length - 1 ? lastPhotoRef : null}>
                    <Link to={`/post/${post.id}`} className="block">
                      <img
                        src={post.images[0]}
                        alt=""
                        className="w-full h-32 object-cover rounded-lg hover:opacity-80 transition-opacity"
                      />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <HiPhoto className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No photos yet</p>
              </div>
            )}
            {contentLoading && photos.length > 0 && (
              <div className="flex justify-center py-2">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="space-y-4">
            {contentLoading && videos.length === 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-40 rounded-xl" />)}
              </div>
            ) : videos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {videos.map((post, index) => (
                  <div key={post.id} ref={index === videos.length - 1 ? lastVideoRef : null}>
                    <Link to={`/post/${post.id}`} className="block">
                      <video
                        src={post.videos[0]}
                        className="w-full h-40 object-cover rounded-xl hover:opacity-80 transition-opacity"
                        preload="metadata"
                      />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <HiFilm className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No videos yet</p>
              </div>
            )}
            {contentLoading && videos.length > 0 && (
              <div className="flex justify-center py-2">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <ClubMembers clubId={clubId} />
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <CommunityEvents schoolId={club.schoolId} isMember={club.isMember} clubId={clubId} />
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="bg-dark-card rounded-2xl border border-dark-border p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">About {club.name}</h3>
              {club.description ? (
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{club.description}</p>
              ) : (
                <p className="text-sm text-gray-500">No description yet</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Members</h3>
              <p className="text-sm text-gray-300">{club.memberCount} members</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">School</h3>
              <p className="text-sm text-gray-300">{club.school?.name}</p>
            </div>
            {club.school?.location && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Location</h3>
                <p className="text-sm text-gray-300">{club.school.location}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Created by</h3>
              <p className="text-sm text-gray-300">{club.creator?.fullName}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubDetailPage;

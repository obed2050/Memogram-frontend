import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { userService, followService, postService } from '../services';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileActions from '../components/profile/ProfileActions';
import ProfileTabs from '../components/profile/ProfileTabs';
import EditProfileModal from '../components/profile/EditProfileModal';
import { ProfileSkeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState({
    postsCount: 0, memoriesCount: 0, reelsCount: 0,
    followersCount: 0, followingCount: 0, schoolsCount: 0,
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  const isOwnProfile = !id || id === currentUser?.id;
  const viewId = id || currentUser?.id;

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userService.getExtendedProfile(viewId);
      setProfile(res.data.user);
      setProfileData(res.data.profile);
      setBadges(res.data.badges || []);
      setStats(res.data.stats);
      setIsFollowing(res.data.isFollowing);
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [viewId]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleFollow = async () => {
    const prev = isFollowing;
    const prevCount = stats.followersCount;
    setIsFollowing(!isFollowing);
    setStats((s) => ({
      ...s,
      followersCount: isFollowing ? s.followersCount - 1 : s.followersCount + 1,
    }));
    try {
      await followService.toggleFollow(profile.id);
    } catch {
      setIsFollowing(prev);
      setStats((s) => ({ ...s, followersCount: prevCount }));
    }
  };

  const handleUploadPhoto = async (file) => {
    try {
      const fd = new FormData();
      fd.append('profilePhoto', file);
      const res = await userService.uploadProfilePhoto(fd);
      setProfile((p) => ({ ...p, profilePhoto: res.data.profilePhoto }));
      updateUser({ profilePhoto: res.data.profilePhoto });
      toast.success('Profile photo updated');
    } catch {
      toast.error('Failed to upload photo');
    }
  };

  const handleUploadCover = async (file) => {
    try {
      const fd = new FormData();
      fd.append('coverPhoto', file);
      const res = await userService.uploadCoverPhoto(fd);
      setProfile((p) => ({ ...p, coverPhoto: res.data.coverPhoto }));
      updateUser({ coverPhoto: res.data.coverPhoto });
      toast.success('Cover photo updated');
    } catch {
      toast.error('Failed to upload cover');
    }
  };

  const handleSaveProfile = async (data) => {
    await userService.updateExtendedProfile(data);
    setProfileData((prev) => ({ ...prev, ...data }));
    if (data.fullName) {
      setProfile((p) => ({ ...p, fullName: data.fullName }));
      updateUser({ fullName: data.fullName });
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await postService.deletePost(postId);
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/profile/${viewId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Profile link copied');
    } catch {
      window.open(url, '_blank');
    }
  };

  if (loading) return <ProfileSkeleton />;
  if (!profile) return <div className="text-center py-16 text-gray-500">User not found</div>;

  return (
    <div className="max-w-[680px] mx-auto space-y-4 pb-8">
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        badges={badges}
        isOwnProfile={isOwnProfile}
        onUploadPhoto={handleUploadPhoto}
        onUploadCover={handleUploadCover}
      />

      {/* Actions */}
      <div className="px-4 md:px-0">
        <ProfileActions
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          isPending={isPending}
          isPrivate={profile?.isPrivate}
          profileId={profile.id}
          onFollow={handleFollow}
          onUnfollow={handleFollow}
          onEdit={() => setShowEdit(true)}
          onShare={handleShare}
        />
      </div>

      {/* Stats */}
      <div className="px-4 md:px-0">
        <ProfileStats stats={stats} />
      </div>

      {/* Tabs + Content */}
      <ProfileTabs
        userId={viewId}
        isOwnProfile={isOwnProfile}
        onDeletePost={handleDeletePost}
      />

      {/* Edit Modal */}
      <AnimatePresence>
        {showEdit && (
          <EditProfileModal
            profile={profile}
            profileData={profileData}
            onClose={() => setShowEdit(false)}
            onSave={handleSaveProfile}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;

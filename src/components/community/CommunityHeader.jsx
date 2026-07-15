import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiMapPin, HiUserGroup, HiCalendarDays, HiCamera } from 'react-icons/hi2';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { communityService } from '../../services';
import toast from 'react-hot-toast';

const CommunityHeader = ({ community, onBannerUpdated }) => {
  const [uploading, setUploading] = useState(false);
  const bannerRef = { current: null };

  const handleBannerClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('banner', file);
        await communityService.uploadBanner(community.schoolId, formData);
        toast.success('Banner updated');
        onBannerUpdated?.();
      } catch {
        toast.error('Failed to upload banner');
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  return (
    <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
      {/* Banner */}
      <div className="relative h-40 md:h-52">
        {community.banner ? (
          <img src={community.banner} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/10 to-accent/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-dark-card/20 to-transparent" />
        <button
          onClick={handleBannerClick}
          disabled={uploading}
          className="absolute top-3 right-3 p-2 glass rounded-xl text-white text-sm hover:bg-white/10 transition-colors"
        >
          <HiCamera className="w-4 h-4" />
        </button>
      </div>

      {/* Info */}
      <div className="px-5 pb-5 -mt-8 relative">
        <div className="flex items-end gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-dark-surface border-3 border-dark-card flex items-center justify-center shrink-0 overflow-hidden">
            {community.schoolLogo ? (
              <img src={community.schoolLogo} alt="" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <span className="text-2xl font-bold gradient-text">
                {community.schoolName?.[0]}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="text-xl font-bold text-white truncate">{community.schoolName}</h1>
            {community.schoolLocation && (
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <HiMapPin className="w-3.5 h-3.5" />
                {community.schoolLocation}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <HiUserGroup className="w-4 h-4" />
            {community.memberCount} members
          </span>
          {community.upcomingEvents > 0 && (
            <span className="flex items-center gap-1.5">
              <HiCalendarDays className="w-4 h-4" />
              {community.upcomingEvents} upcoming
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityHeader;

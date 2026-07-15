import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiCamera, HiCalendarDays, HiAcademicCap, HiUserGroup,
} from 'react-icons/hi2';
import Avatar from '../ui/Avatar';
import { BadgeRow } from '../badges/BadgeDisplay';
import { formatDate } from '../../utils';

const ProfileHeader = ({ profile, badges, isOwnProfile, onUploadPhoto, onUploadCover }) => {
  const coverInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const [coverHover, setCoverHover] = useState(false);
  const [photoHover, setPhotoHover] = useState(false);

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onUploadCover(file);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onUploadPhoto(file);
  };

  return (
    <div className="relative">
      {/* Cover Photo */}
      <div
        className="relative h-52 md:h-64 rounded-2xl overflow-hidden bg-dark-surface group"
        onMouseEnter={() => setCoverHover(true)}
        onMouseLeave={() => setCoverHover(false)}
      >
        {profile.coverPhoto ? (
          <img
            src={profile.coverPhoto}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/15 via-dark-card to-accent/10" />
        )}

        {/* Cover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {isOwnProfile && (
          <>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverChange}
            />
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: coverHover ? 1 : 0 }}
              onClick={() => coverInputRef.current?.click()}
              className="absolute top-4 right-4 p-2.5 glass rounded-xl text-white text-sm flex items-center gap-1.5 cursor-pointer"
            >
              <HiCamera className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">Change Cover</span>
            </motion.button>
          </>
        )}

        {/* Decorative corner glow */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Profile Info */}
      <div className="px-4 md:px-6 -mt-14 relative z-10">
        <div className="flex items-end gap-4">
          {/* Avatar */}
          <div
            className="relative group"
            onMouseEnter={() => setPhotoHover(true)}
            onMouseLeave={() => setPhotoHover(false)}
          >
            <div className="rounded-full p-[3px] bg-gradient-to-br from-primary via-primary-light to-accent">
              <div className="rounded-full bg-dark p-[2px]">
                <Avatar
                  src={profile.profilePhoto}
                  name={profile.fullName}
                  size="2xl"
                  className="border-0"
                />
              </div>
            </div>

            {isOwnProfile && (
              <>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: photoHover ? 1 : 0, scale: photoHover ? 1 : 0.8 }}
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center cursor-pointer"
                >
                  <HiCamera className="w-6 h-6 text-white" />
                </motion.button>
              </>
            )}
          </div>

          {/* Name + Username */}
          <div className="flex-1 pb-2">
            <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">
              {profile.fullName}
            </h1>
            <p className="text-gray-500 text-sm">@{profile.username}</p>
          </div>
        </div>

        {/* Bio + Badges */}
        <div className="mt-3 space-y-2">
          <BadgeRow badges={badges} className="mt-1" />
          {profile.bio && (
            <p className="text-gray-300 text-sm leading-relaxed">{profile.bio}</p>
          )}
        </div>

        {/* Meta Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-sm text-gray-500">
          {profile.currentSchool && (
            <span className="flex items-center gap-1.5">
              <HiAcademicCap className="w-4 h-4 text-primary/60" />
              {profile.currentSchool}
            </span>
          )}
          {profile.generation && (
            <span className="flex items-center gap-1.5">
              <HiUserGroup className="w-4 h-4 text-accent/60" />
              Gen {profile.generation}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <HiCalendarDays className="w-4 h-4 text-gray-600" />
            Joined {formatDate(profile.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;

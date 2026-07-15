import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiUserGroup, HiMapPin } from 'react-icons/hi2';

const CommunityCard = ({ community }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Link
        to={`/communities/${community.schoolId}`}
        className="block bg-dark-card rounded-2xl border border-dark-border overflow-hidden hover:border-dark-hover transition-all group"
      >
        {/* Banner */}
        <div className="h-28 relative overflow-hidden">
          {community.banner ? (
            <img src={community.banner} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/10 to-accent/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="p-4 -mt-6 relative">
          <div className="flex items-end gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-dark-surface border-2 border-dark-card flex items-center justify-center shrink-0 overflow-hidden">
              {community.schoolLogo ? (
                <img src={community.schoolLogo} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold gradient-text">
                  {community.schoolName?.[0]}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-sm truncate group-hover:text-primary-light transition-colors">
                {community.schoolName}
              </h3>
              {community.schoolLocation && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <HiMapPin className="w-3 h-3" />
                  {community.schoolLocation}
                </p>
              )}
            </div>
          </div>

          {community.description && (
            <p className="text-xs text-gray-400 line-clamp-2 mb-3">{community.description}</p>
          )}

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <HiUserGroup className="w-3.5 h-3.5" />
              {community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}
            </span>
            {community.isMember && (
              <span className="text-[10px] font-medium text-primary-light bg-primary/10 px-2 py-0.5 rounded-full">
                Your School
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CommunityCard;

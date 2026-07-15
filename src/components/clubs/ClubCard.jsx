import { Link } from 'react-router-dom';
import { HiUserGroup } from 'react-icons/hi2';

const ClubCard = ({ club }) => (
  <Link
    to={`/clubs/${club.id}`}
    className="block bg-dark-card rounded-2xl border border-dark-border overflow-hidden hover:border-dark-hover transition-all group"
  >
    {club.coverImage && (
      <div className="h-24 relative">
        <img src={club.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
    )}
    <div className="p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center shrink-0 overflow-hidden -mt-6 border-2 border-dark-card">
          {club.logo ? (
            <img src={club.logo} alt="" className="w-full h-full object-cover rounded-xl" />
          ) : (
            <span className="text-lg font-bold text-green-400">{club.name?.charAt(0)}</span>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{club.name}</h3>
          <p className="text-xs text-gray-500">{club.school?.name}</p>
        </div>
      </div>
      {club.description && (
        <p className="text-xs text-gray-400 line-clamp-2 mb-2">{club.description}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-gray-500">
          <HiUserGroup className="w-3.5 h-3.5" />
          <span className="text-xs">{club.memberCount} members</span>
        </div>
        {club.isMember && (
          <span className="text-[10px] font-medium text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Joined</span>
        )}
      </div>
    </div>
  </Link>
);

export default ClubCard;

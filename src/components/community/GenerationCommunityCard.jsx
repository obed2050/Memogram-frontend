import { Link } from 'react-router-dom';
import { HiUserGroup } from 'react-icons/hi2';

const GenerationCommunityCard = ({ generation }) => {
  const { schoolId, schoolName, schoolLogo, generation: gen, memberCount } = generation;

  return (
    <Link
      to={`/communities/${schoolId}/generation/${encodeURIComponent(gen)}`}
      className="block bg-dark-card rounded-2xl border border-dark-border p-4 hover:border-dark-hover transition-all group"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 overflow-hidden">
          {schoolLogo ? (
            <img src={schoolLogo} alt="" className="w-full h-full object-cover rounded-xl" />
          ) : (
            <span className="text-lg font-bold text-primary-light">
              {schoolName?.charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{schoolName}</p>
          <p className="text-xs text-primary-light font-medium">Gen {gen}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-gray-500">
        <HiUserGroup className="w-3.5 h-3.5" />
        <span className="text-xs">{memberCount} members</span>
      </div>
    </Link>
  );
};

export default GenerationCommunityCard;

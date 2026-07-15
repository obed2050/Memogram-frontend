import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiAcademicCap } from 'react-icons/hi2';
import { useAuth } from '../../contexts/AuthContext';
import { communityService } from '../../services';

const ContentSidebar = () => {
  const { user } = useAuth();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const schoolRes = await communityService.getMyCommunities();
        const memberSchools = schoolRes.data.communities?.filter((c) => c.isMember) || [];
        setSchools(memberSchools);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <aside className="w-[300px] shrink-0 h-full border-r border-dark-border bg-dark-card/20">
      <div className="sidebar-scroll p-4 space-y-5">
        {/* Your Schools */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-semibold text-gray-300">Your Schools</h3>
            <Link to="/communities" className="text-[11px] font-medium text-primary-light hover:text-primary transition-colors">
              View All
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2.5">
                  <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="skeleton h-3.5 w-28" />
                    <div className="skeleton h-2.5 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : schools.length > 0 ? (
            <div className="space-y-1">
              {schools.map((school) => (
                <Link
                  key={school.schoolId}
                  to={`/communities/${school.schoolId}`}
                  className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-dark-surface/40 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 overflow-hidden">
                    {school.schoolLogo ? (
                      <img src={school.schoolLogo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <HiAcademicCap className="w-5 h-5 text-primary-light" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate group-hover:text-primary-light transition-colors">
                      {school.schoolName}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {school.memberCount} members
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Link
              to="/communities"
              className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-dark-surface/40 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <HiAcademicCap className="w-5 h-5 text-primary-light/50" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Add Your Schools</p>
                <p className="text-[11px] text-gray-600">Connect with your class</p>
              </div>
            </Link>
          )}
        </div>

        {/* Footer */}
        <div className="px-1 pt-2">
          <p className="text-[10px] text-gray-700 leading-relaxed">
            Memogram &copy; 2026 &middot; Relive your school memories
          </p>
        </div>
      </div>
    </aside>
  );
};

export default ContentSidebar;

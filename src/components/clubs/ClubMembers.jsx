import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import Skeleton from '../ui/Skeleton';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import { clubService } from '../../services';
import toast from 'react-hot-toast';

const ROLE_BADGES = {
  owner: 'Owner',
  admin: 'Admin',
};

const ClubMembers = ({ clubId }) => {
  const [members, setMembers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async (pageNum = 1) => {
    try {
      const res = await clubService.getMembers(clubId, { page: pageNum, limit: 20 });
      const newMembers = res.data.data;
      if (pageNum === 1) {
        setMembers(newMembers);
      } else {
        setMembers((prev) => [...prev, ...newMembers]);
      }
      setHasMore(res.data.pagination.hasNext);
    } catch {
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchMembers(1);
  }, [fetchMembers]);

  const fetchMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMembers(nextPage);
  }, [page, fetchMembers]);

  const lastRef = useInfiniteScroll(fetchMore, hasMore, loading);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-dark-surface rounded-xl">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {members.map((member, index) => (
          <Link
            key={member.id}
            to={`/profile/${member.id}`}
            ref={index === members.length - 1 ? lastRef : null}
            className="flex items-center gap-3 p-3 rounded-xl bg-dark-surface hover:bg-dark-hover transition-colors"
          >
            <Avatar src={member.profilePhoto} name={member.fullName} size="md" online={member.isOnline} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-white text-sm truncate">{member.fullName}</p>
                {ROLE_BADGES[member.role] && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    member.role === 'owner' ? 'bg-yellow-400/10 text-yellow-400' : 'bg-blue-400/10 text-blue-400'
                  }`}>
                    {ROLE_BADGES[member.role]}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">@{member.username}</p>
            </div>
          </Link>
        ))}
      </div>
      {!hasMore && members.length > 0 && (
        <p className="text-center text-gray-600 text-xs py-2">All members loaded</p>
      )}
      {members.length === 0 && (
        <p className="text-center text-gray-500 text-sm py-8">No members yet</p>
      )}
    </div>
  );
};

export default ClubMembers;

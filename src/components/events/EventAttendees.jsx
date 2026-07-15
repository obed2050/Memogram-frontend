import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HiUserGroup } from 'react-icons/hi2';
import { eventService } from '../../services';
import Avatar from '../ui/Avatar';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import toast from 'react-hot-toast';

const EventAttendees = ({ eventId, isAttending, onToggleAttend }) => {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchAttendees = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await eventService.getAttendees(eventId, { page: pageNum, limit: 20 });
      if (pageNum === 1) {
        setAttendees(res.data.data);
      } else {
        setAttendees((prev) => [...prev, ...res.data.data]);
      }
      setHasMore(res.data.pagination.hasNext);
    } catch {
      toast.error('Failed to load attendees');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchAttendees(1);
  }, [fetchAttendees]);

  const fetchMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAttendees(nextPage);
  }, [page, fetchAttendees]);

  const lastRef = useInfiniteScroll(fetchMore, hasMore, loading);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-400">Attendees</h3>
        <button
          onClick={onToggleAttend}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            isAttending
              ? 'bg-primary/20 text-primary-light border border-primary/30 hover:bg-primary/30'
              : 'bg-primary text-white hover:bg-primary/80'
          }`}
        >
          {isAttending ? 'Attending' : 'Attend'}
        </button>
      </div>

      {loading && attendees.length === 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
        </div>
      ) : attendees.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {attendees.map((attendee, index) => (
            <Link
              key={attendee.id}
              to={`/profile/${attendee.id}`}
              ref={index === attendees.length - 1 ? lastRef : null}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-dark-surface hover:bg-dark-hover transition-colors"
            >
              <Avatar src={attendee.profilePhoto} name={attendee.fullName} size="sm" online={attendee.isOnline} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{attendee.fullName}</p>
                <p className="text-xs text-gray-500 truncate">@{attendee.username}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <HiUserGroup className="w-6 h-6 text-gray-600 mx-auto mb-1" />
          <p className="text-gray-500 text-xs">No attendees yet</p>
          <p className="text-gray-600 text-xs">Be the first to attend this event</p>
        </div>
      )}
    </div>
  );
};

export default EventAttendees;

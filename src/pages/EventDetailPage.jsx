import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft, HiCalendarDays, HiMapPin, HiUserGroup, HiChatBubbleLeftRight,
  HiPhoto, HiFilm, HiPlus, HiTrash, HiPencil,
} from 'react-icons/hi2';
import { eventService, memoryService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import EventMediaGallery from '../components/events/EventMediaGallery';
import EventComments from '../components/events/EventComments';
import EventAttendees from '../components/events/EventAttendees';
import PostCard from '../components/feed/PostCard';
import { PostSkeleton } from '../components/ui/Skeleton';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import toast from 'react-hot-toast';

const EVENT_TYPE_LABELS = {
  graduation: 'Graduation',
  sports: 'Sports Day',
  trip: 'Trip',
  talent_show: 'Talent Show',
  science_fair: 'Science Fair',
  cultural: 'Cultural Event',
  other: 'Event',
};

const TABS = [
  { key: 'details', label: 'Details', icon: HiCalendarDays },
  { key: 'memories', label: 'Memories', icon: HiPhoto },
  { key: 'attendees', label: 'Attendees', icon: HiUserGroup },
  { key: 'comments', label: 'Comments', icon: HiChatBubbleLeftRight },
];

const EventDetailPage = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [uploading, setUploading] = useState(false);

  const [memories, setMemories] = useState([]);
  const [memoriesLoading, setMemoriesLoading] = useState(false);
  const [memoryPage, setMemoryPage] = useState(1);
  const [hasMoreMemories, setHasMoreMemories] = useState(true);

  const fetchEvent = useCallback(async () => {
    try {
      const res = await eventService.getEvent(eventId);
      setEvent(res.data.event);
    } catch {
      toast.error('Failed to load event');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const fetchMemories = useCallback(async (pageNum = 1) => {
    try {
      setMemoriesLoading(true);
      const res = await eventService.getLinkedMemories(eventId, { page: pageNum, limit: 20 });
      if (pageNum === 1) {
        setMemories(res.data.data);
      } else {
        setMemories((prev) => [...prev, ...res.data.data]);
      }
      setHasMoreMemories(res.data.pagination.hasNext);
    } catch {
      toast.error('Failed to load memories');
    } finally {
      setMemoriesLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (activeTab === 'memories') fetchMemories(1);
  }, [activeTab, fetchMemories]);

  const fetchMoreMemories = useCallback(() => {
    const nextPage = memoryPage + 1;
    setMemoryPage(nextPage);
    fetchMemories(nextPage);
  }, [memoryPage, fetchMemories]);

  const lastMemoryRef = useInfiniteScroll(fetchMoreMemories, hasMoreMemories, memoriesLoading);

  const handleToggleAttend = async () => {
    try {
      const res = await eventService.toggleAttendance(eventId);
      setEvent((prev) => ({
        ...prev,
        isAttending: res.data.isAttending,
        attendeesCount: prev.attendeesCount + (res.data.isAttending ? 1 : -1),
      }));
      toast.success(res.data.isAttending ? 'You are attending!' : 'Removed from attendees');
    } catch {
      toast.error('Failed to update attendance');
    }
  };

  const handleUploadImages = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach((f) => formData.append('images', f));
      const res = await eventService.uploadImages(eventId, formData);
      setEvent((prev) => ({ ...prev, images: res.data.images }));
      toast.success('Images uploaded');
    } catch {
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = async (index) => {
    try {
      const res = await eventService.removeImage(eventId, index);
      setEvent((prev) => ({ ...prev, images: res.data.images }));
      toast.success('Image removed');
    } catch {
      toast.error('Failed to remove image');
    }
  };

  const handleUploadVideos = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach((f) => formData.append('videos', f));
      const res = await eventService.uploadVideos(eventId, formData);
      setEvent((prev) => ({ ...prev, videos: res.data.videos }));
      toast.success('Videos uploaded');
    } catch {
      toast.error('Failed to upload videos');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveVideo = async (index) => {
    try {
      const res = await eventService.removeVideo(eventId, index);
      setEvent((prev) => ({ ...prev, videos: res.data.videos }));
      toast.success('Video removed');
    } catch {
      toast.error('Failed to remove video');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventService.deleteEvent(eventId);
      toast.success('Event deleted');
      navigate(-1);
    } catch {
      toast.error('Failed to delete event');
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

  if (!event) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Event not found</p>
        <Link to="/communities" className="text-primary-light text-sm mt-2 inline-block">Back to communities</Link>
      </div>
    );
  }

  const isOwner = event.isCreator || event.userId === user?.id;
  const isPast = new Date(event.eventDate) < new Date();

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <Link
        to={event.school ? `/communities/${event.school.id}` : '/communities'}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
      >
        <HiArrowLeft className="w-4 h-4" />
        {event.school?.name || 'Community'}
      </Link>

      {/* Event Hero */}
      <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
        {event.coverImage && (
          <div className="h-48 relative">
            <img src={event.coverImage} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            {isPast && (
              <span className="absolute top-3 left-3 px-2.5 py-1 bg-gray-800/80 text-gray-300 text-xs rounded-full font-medium">
                Past Event
              </span>
            )}
            {event.eventType !== 'other' && (
              <span className="absolute top-3 right-3 px-2.5 py-1 bg-primary/80 text-white text-xs rounded-full font-medium">
                {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
              </span>
            )}
          </div>
        )}

        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-white">{event.title}</h1>
              <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <HiCalendarDays className="w-3.5 h-3.5" />
                  {new Date(event.eventDate).toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1">
                    <HiMapPin className="w-3.5 h-3.5" />
                    {event.location}
                  </span>
                )}
              </div>
            </div>
            {isOwner && (
              <button onClick={handleDelete} className="p-2 rounded-lg hover:bg-dark-hover text-gray-500 hover:text-red-400 transition-colors">
                <HiTrash className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <HiUserGroup className="w-3.5 h-3.5" />
              {event.attendeesCount || 0} attending
            </span>
            <span className="flex items-center gap-1">
              <HiChatBubbleLeftRight className="w-3.5 h-3.5" />
              {event.commentsCount || 0} comments
            </span>
            {(event.images?.length > 0 || event.videos?.length > 0) && (
              <span className="flex items-center gap-1">
                <HiPhoto className="w-3.5 h-3.5" />
                {(event.images?.length || 0) + (event.videos?.length || 0)} media
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Created by</span>
            <span className="text-white font-medium">{event.creator?.fullName}</span>
          </div>
        </div>
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
        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            {event.description && (
              <div className="bg-dark-card rounded-2xl border border-dark-border p-4">
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {/* Media Upload Buttons */}
            {isOwner && (
              <div className="bg-dark-card rounded-2xl border border-dark-border p-4">
                <p className="text-xs font-semibold text-gray-400 mb-3">Event Media</p>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-2 bg-dark-surface rounded-xl text-xs font-medium text-gray-300 hover:bg-dark-hover cursor-pointer transition-colors">
                    <HiPhoto className="w-3.5 h-3.5" />
                    {uploading ? 'Uploading...' : 'Add Images'}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleUploadImages}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  <label className="flex items-center gap-1.5 px-3 py-2 bg-dark-surface rounded-xl text-xs font-medium text-gray-300 hover:bg-dark-hover cursor-pointer transition-colors">
                    <HiFilm className="w-3.5 h-3.5" />
                    {uploading ? 'Uploading...' : 'Add Videos'}
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={handleUploadVideos}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>
            )}

            <EventMediaGallery
              images={event.images || []}
              videos={event.videos || []}
              onRemoveImage={isOwner ? handleRemoveImage : undefined}
              onRemoveVideo={isOwner ? handleRemoveVideo : undefined}
              isOwner={isOwner}
            />

            {(!event.images || event.images.length === 0) && (!event.videos || event.videos.length === 0) && !event.description && (
              <p className="text-center text-gray-500 text-sm py-4">No additional details for this event</p>
            )}
          </div>
        )}

        {/* Memories Tab */}
        {activeTab === 'memories' && (
          <div className="space-y-4">
            {memoriesLoading && memories.length === 0 ? (
              <div className="space-y-4">
                {[1, 2].map((i) => <PostSkeleton key={i} />)}
              </div>
            ) : memories.length > 0 ? (
              <div className="space-y-4">
                {memories.map((memory, index) => (
                  <div key={memory.id} ref={index === memories.length - 1 ? lastMemoryRef : null}>
                    <PostCard post={{ ...memory, type: 'memory' }} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <HiPhoto className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No memories linked yet</p>
                <p className="text-gray-600 text-xs">Link memories from your profile to this event</p>
              </div>
            )}
          </div>
        )}

        {/* Attendees Tab */}
        {activeTab === 'attendees' && (
          <EventAttendees
            eventId={eventId}
            isAttending={event.isAttending}
            onToggleAttend={handleToggleAttend}
          />
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <EventComments eventId={eventId} />
        )}
      </div>
    </div>
  );
};

export default EventDetailPage;

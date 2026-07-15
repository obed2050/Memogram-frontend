import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiCalendarDays, HiMapPin, HiPlus, HiTrash, HiUserGroup, HiPhoto, HiFilm } from 'react-icons/hi2';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { communityService, eventService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const EVENT_TYPES = [
  { value: 'other', label: 'Select type...' },
  { value: 'graduation', label: 'Graduation' },
  { value: 'sports', label: 'Sports Day' },
  { value: 'trip', label: 'Trip' },
  { value: 'talent_show', label: 'Talent Show' },
  { value: 'science_fair', label: 'Science Fair' },
  { value: 'cultural', label: 'Cultural Event' },
];

const EVENT_TYPE_COLORS = {
  graduation: 'from-yellow-500/20 to-yellow-600/5',
  sports: 'from-green-500/20 to-green-600/5',
  trip: 'from-blue-500/20 to-blue-600/5',
  talent_show: 'from-pink-500/20 to-pink-600/5',
  science_fair: 'from-purple-500/20 to-purple-600/5',
  cultural: 'from-orange-500/20 to-orange-600/5',
  other: 'from-accent/20 to-accent/5',
};

const CommunityEvents = ({ schoolId, isMember }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', eventDate: '', location: '', eventType: 'other',
  });
  const [coverFile, setCoverFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await communityService.getEvents(schoolId, { limit: 50 });
      setEvents(res.data.data);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.eventDate) return;
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('eventDate', form.eventDate);
      formData.append('location', form.location);
      formData.append('eventType', form.eventType);
      if (coverFile) formData.append('coverImage', coverFile);

      const res = await communityService.createEvent(schoolId, formData);
      const newEvent = res.data.event;

      if (imageFiles.length > 0) {
        const imgFormData = new FormData();
        imageFiles.forEach((f) => imgFormData.append('images', f));
        try {
          const imgRes = await eventService.uploadImages(newEvent.id, imgFormData);
          newEvent.images = imgRes.data.images;
        } catch { /* continue */ }
      }

      toast.success('Event created');
      setForm({ title: '', description: '', eventDate: '', location: '', eventType: 'other' });
      setCoverFile(null);
      setImageFiles([]);
      setVideoFiles([]);
      setShowCreate(false);
      fetchEvents();
    } catch (err) {
      toast.error(err.message || 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (eventId) => {
    try {
      await communityService.deleteEvent(schoolId, eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      toast.success('Event deleted');
    } catch {
      toast.error('Failed to delete event');
    }
  };

  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.eventDate) >= now);
  const pastEvents = events.filter((e) => new Date(e.eventDate) < now);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-400">Events</h3>
        {isMember && (
          <Button variant="ghost" size="sm" onClick={() => setShowCreate(true)}>
            <HiPlus className="w-4 h-4" />
            Create
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {upcomingEvents.length > 0 && (
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} userId={user?.id} onDelete={handleDelete} />
              ))}
            </div>
          )}

          {pastEvents.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Past Events</p>
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} userId={user?.id} onDelete={handleDelete} isPast />
              ))}
            </div>
          )}

          {events.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-8">No events yet</p>
          )}
        </>
      )}

      {/* Create Event Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Event" size="lg">
        <div className="p-6 space-y-4">
          <Input
            label="Title"
            placeholder="Event title (e.g., Graduation 2026)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Event Type</label>
            <select
              value={form.eventType}
              onChange={(e) => setForm({ ...form, eventType: e.target.value })}
              className="input-dark w-full px-4 py-3 rounded-xl text-white text-sm"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What's this event about?"
              rows={3}
              className="input-dark w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 text-sm resize-none"
            />
          </div>

          <Input
            label="Date & Time"
            type="datetime-local"
            value={form.eventDate}
            onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            required
          />

          <Input
            label="Location"
            placeholder="Event location (optional)"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files[0])}
              className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary-light hover:file:bg-primary/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Event Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImageFiles(Array.from(e.target.files))}
              className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary-light hover:file:bg-primary/30"
            />
            {imageFiles.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">{imageFiles.length} image(s) selected</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={creating} disabled={!form.title.trim() || !form.eventDate}>
              Create Event
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const EventCard = ({ event, userId, onDelete, isPast }) => {
  const EVENT_TYPE_ICONS = {
    graduation: '🎓',
    sports: '⚽',
    trip: '🚌',
    talent_show: '🎭',
    science_fair: '🔬',
    cultural: '🎭',
    other: '📅',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border border-dark-border overflow-hidden ${isPast ? 'bg-dark-surface/50 opacity-70' : 'bg-dark-surface'}`}
    >
      {event.coverImage && (
        <div className="h-24 relative">
          <img src={event.coverImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/events/${event.id}`} className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{EVENT_TYPE_ICONS[event.eventType] || '📅'}</span>
              <h4 className="font-medium text-white text-sm truncate">{event.title}</h4>
            </div>
            <p className="text-xs text-gray-400">
              {new Date(event.eventDate).toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
            {event.location && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <HiMapPin className="w-3 h-3" />
                {event.location}
              </p>
            )}
          </Link>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <HiUserGroup className="w-3 h-3" />
              {event.attendeesCount || 0}
            </div>
            {event.images?.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <HiPhoto className="w-3 h-3" />
                {event.images.length}
              </div>
            )}
            {event.userId === userId && (
              <button
                onClick={() => onDelete(event.id)}
                className="p-1.5 rounded-lg hover:bg-dark-hover text-gray-500 hover:text-red-400 transition-colors"
              >
                <HiTrash className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CommunityEvents;

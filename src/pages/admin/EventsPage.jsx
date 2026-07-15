import { useState, useEffect, useCallback } from 'react';
import { HiOutlineTrash } from 'react-icons/hi2';
import DataTable from '../../components/admin/DataTable';
import { adminService } from '../../services';
import { formatDate } from '../../utils';
import toast from 'react-hot-toast';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getEvents({ page, limit: 20 });
      setEvents(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch {} finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleDelete = async (eventId) => {
    if (!confirm('Delete this event?')) return;
    try {
      await adminService.deleteEvent(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      toast.success('Event deleted');
    } catch { toast.error('Failed to delete event'); }
  };

  const columns = [
    { header: 'Title', render: (row) => <span className="text-sm font-medium text-white">{row.title}</span> },
    { header: 'Creator', render: (row) => <span className="text-xs text-gray-300">{row.creator?.fullName}</span> },
    { header: 'School', render: (row) => <span className="text-xs text-gray-400">{row.school?.name || '—'}</span> },
    { header: 'Date', render: (row) => <span className="text-xs text-gray-400">{row.eventDate ? formatDate(row.eventDate) : '—'}</span> },
    { header: 'Created', render: (row) => <span className="text-xs text-gray-500">{formatDate(row.createdAt)}</span> },
    {
      header: '',
      render: (row) => (
        <button onClick={() => handleDelete(row.id)} className="p-1.5 rounded-lg hover:bg-dark-surface text-gray-500 hover:text-red-400 transition-colors">
          <HiOutlineTrash className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Events</h1>
        <p className="text-sm text-gray-500 mt-1">Manage community events</p>
      </div>
      <DataTable columns={columns} data={events} page={page} totalPages={totalPages} onPageChange={setPage} loading={loading} emptyMessage="No events found" />
    </div>
  );
};

export default EventsPage;

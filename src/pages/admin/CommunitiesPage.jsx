import { useState, useEffect, useCallback } from 'react';
import DataTable from '../../components/admin/DataTable';
import { adminService } from '../../services';
import { formatDate } from '../../utils';

const CommunitiesPage = () => {
  const [communities, setCommunities] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchCommunities = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getCommunities({ page, limit: 20 });
      setCommunities(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch {} finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchCommunities(); }, [fetchCommunities]);

  const columns = [
    {
      header: 'School',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-white">{row.school?.name || '—'}</p>
          <p className="text-xs text-gray-500">{row.school?.location || ''}</p>
        </div>
      ),
    },
    { header: 'Events', render: (row) => <span className="text-xs text-gray-400">{row.eventsCount || 0}</span> },
    { header: 'Created', render: (row) => <span className="text-xs text-gray-500">{formatDate(row.createdAt)}</span> },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Communities</h1>
        <p className="text-sm text-gray-500 mt-1">All school communities</p>
      </div>
      <DataTable columns={columns} data={communities} page={page} totalPages={totalPages} onPageChange={setPage} loading={loading} emptyMessage="No communities found" />
    </div>
  );
};

export default CommunitiesPage;

import { useState, useEffect, useCallback } from 'react';
import { HiMagnifyingGlass, HiUserGroup, HiPlus } from 'react-icons/hi2';
import { clubService, communityService } from '../services';
import ClubCard from '../components/clubs/ClubCard';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import toast from 'react-hot-toast';

const ClubsPage = () => {
  const [tab, setTab] = useState('my');
  const [myClubs, setMyClubs] = useState([]);
  const [browseClubs, setBrowseClubs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [browseLoading, setBrowseLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', schoolId: '' });
  const [userSchools, setUserSchools] = useState([]);

  useEffect(() => {
    const fetchMy = async () => {
      try {
        const res = await clubService.getMyClubs();
        setMyClubs(res.data.clubs);
      } catch {
        toast.error('Failed to load clubs');
      } finally {
        setLoading(false);
      }
    };
    fetchMy();
  }, []);

  const fetchBrowse = useCallback(async (pageNum = 1, query = '') => {
    try {
      setBrowseLoading(true);
      const res = await clubService.browseClubs({ page: pageNum, limit: 20, q: query || undefined });
      const newClubs = res.data.data;
      if (pageNum === 1) {
        setBrowseClubs(newClubs);
      } else {
        setBrowseClubs((prev) => [...prev, ...newClubs]);
      }
      setHasMore(res.data.pagination.hasNext);
    } catch {
      toast.error('Failed to load clubs');
    } finally {
      setBrowseLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'browse') fetchBrowse(1, searchQuery);
  }, [tab, fetchBrowse, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBrowse(1, searchQuery);
  };

  const fetchMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBrowse(nextPage, searchQuery);
  }, [page, searchQuery, fetchBrowse]);

  const lastRef = useInfiniteScroll(fetchMore, hasMore, browseLoading);

  const openCreate = async () => {
    try {
      const res = await communityService.getMyCommunities();
      const schools = res.data.communities.filter((c) => c.isMember);
      setUserSchools(schools);
      setShowCreate(true);
    } catch {
      toast.error('Failed to load your schools');
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.schoolId) return;
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('schoolId', form.schoolId);

      const res = await clubService.createClub(formData);
      setMyClubs((prev) => [{ ...res.data.club, isMember: true, role: 'owner' }, ...prev]);
      setForm({ name: '', description: '', schoolId: '' });
      setShowCreate(false);
      toast.success('Club created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create club');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Clubs</h1>
          <p className="text-gray-500 text-sm">Join clubs that match your interests</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <HiPlus className="w-4 h-4" />
          Create
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-card rounded-xl p-1 border border-dark-border">
        <button
          onClick={() => setTab('my')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'my' ? 'bg-dark-surface text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          My Clubs ({myClubs.length})
        </button>
        <button
          onClick={() => setTab('browse')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'browse' ? 'bg-dark-surface text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Browse All
        </button>
      </div>

      {/* My Clubs */}
      {tab === 'my' && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
            </div>
          ) : myClubs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myClubs.map((club) => <ClubCard key={club.id} club={club} />)}
            </div>
          ) : (
            <div className="text-center py-16">
              <HiUserGroup className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-3">You haven't joined any clubs yet</p>
              <p className="text-gray-600 text-xs">Browse clubs to find ones that match your interests</p>
            </div>
          )}
        </div>
      )}

      {/* Browse */}
      {tab === 'browse' && (
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clubs..."
              className="input-dark w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder-gray-500 text-sm"
            />
          </form>

          {browseLoading && browseClubs.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {browseClubs.map((club, index) => (
                <div key={club.id} ref={index === browseClubs.length - 1 ? lastRef : null}>
                  <ClubCard club={club} />
                </div>
              ))}
            </div>
          )}

          {browseLoading && browseClubs.length > 0 && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!browseLoading && browseClubs.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-8">No clubs found</p>
          )}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Club" size="md">
        <div className="p-6 space-y-4">
          <Input
            label="Club Name"
            placeholder="e.g., Football Club, Music Society"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">School</label>
            <select
              value={form.schoolId}
              onChange={(e) => setForm({ ...form, schoolId: e.target.value })}
              className="input-dark w-full px-4 py-3 rounded-xl text-white text-sm"
            >
              <option value="">Select your school</option>
              {userSchools.map((s) => (
                <option key={s.schoolId} value={s.schoolId}>{s.schoolName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What is this club about?"
              rows={3}
              className="input-dark w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 text-sm resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={creating} disabled={!form.name.trim() || !form.schoolId}>
              Create Club
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClubsPage;

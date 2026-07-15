import { useState, useEffect, useCallback, useRef } from 'react';
import { HiPlus, HiQuestionMarkCircle, HiEye } from 'react-icons/hi2';
import { guessWhoService } from '../services';
import GuessWhoCard from '../components/guess-who/GuessWhoCard';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { PostSkeleton } from '../components/ui/Skeleton';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import toast from 'react-hot-toast';

const GuessWhoPage = () => {
  const [tab, setTab] = useState('active');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [hint, setHint] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileRef = useRef(null);

  const fetchItems = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const fn = tab === 'active' ? guessWhoService.getActive : guessWhoService.getRevealed;
      const res = await fn({ page: pageNum, limit: 20 });
      if (pageNum === 1) {
        setItems(res.data.data);
      } else {
        setItems((prev) => [...prev, ...res.data.data]);
      }
      setHasMore(res.data.pagination.hasNext);
    } catch {
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    setPage(1);
    setItems([]);
    fetchItems(1);
  }, [tab, fetchItems]);

  const fetchMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchItems(nextPage);
  }, [page, fetchItems]);

  const lastRef = useInfiniteScroll(fetchMore, hasMore, loading);

  const handlePhotoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const resetCreate = () => {
    setHint('');
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handleCreate = async () => {
    if (!photoFile) {
      toast.error('Please upload a photo');
      return;
    }
    try {
      setCreating(true);
      const formData = new FormData();
      formData.append('photo', photoFile);
      if (hint) formData.append('hint', hint);

      const res = await guessWhoService.create(formData);
      setItems((prev) => [res.data.challenge, ...prev]);
      setShowCreate(false);
      resetCreate();
      setTab('active');
      toast.success('Challenge created! Identity hides for 24 hours.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <HiQuestionMarkCircle className="w-6 h-6 text-accent" />
            Guess Who
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Anonymous childhood photos — can you guess?</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-accent rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
        >
          <HiPlus className="w-4 h-4" />
          Upload
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-card rounded-xl p-1 border border-dark-border">
        <button
          onClick={() => setTab('active')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'active' ? 'bg-dark-surface text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <HiQuestionMarkCircle className="w-4 h-4" />
          Active
        </button>
        <button
          onClick={() => setTab('revealed')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'revealed' ? 'bg-dark-surface text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <HiEye className="w-4 h-4" />
          Revealed
        </button>
      </div>

      {/* Feed */}
      {loading && items.length === 0 ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <PostSkeleton key={i} />)}
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} ref={index === items.length - 1 ? lastRef : null}>
              <GuessWhoCard challenge={item} onDelete={handleDelete} />
            </div>
          ))}
          {loading && (
            <div className="flex justify-center py-2">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!hasMore && items.length > 0 && (
            <p className="text-center text-gray-600 text-xs py-2">No more challenges</p>
          )}
        </div>
      ) : (
        <div className="text-center py-16">
          <HiQuestionMarkCircle className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">
            {tab === 'active' ? 'No active challenges' : 'No revealed challenges yet'}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            {tab === 'active' ? 'Be the first to upload a childhood photo!' : 'Check back later for reveals'}
          </p>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); resetCreate(); }} title="Guess Who Challenge" size="md">
        <div className="p-6 space-y-5">
          <p className="text-xs text-gray-500 text-center">
            Your identity will be hidden for 24 hours, then revealed automatically.
          </p>

          {/* Photo Upload */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoFile}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className={`w-full aspect-video rounded-2xl border-2 border-dashed transition-all overflow-hidden ${
              photoPreview
                ? 'border-primary/50'
                : 'border-dark-border hover:border-primary/30 bg-dark-surface'
            }`}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
                <HiPlus className="w-8 h-8" />
                <span className="text-sm font-medium">Upload childhood photo</span>
                <span className="text-xs text-gray-600">JPEG, PNG, WebP</span>
              </div>
            )}
          </button>

          {/* Hint */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Hint (optional)</label>
            <input
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="e.g. I was 5 years old here..."
              maxLength={300}
              className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
            />
          </div>

          <Button
            onClick={handleCreate}
            loading={creating}
            disabled={!photoFile}
            className="w-full bg-gradient-to-r from-primary to-accent"
          >
            Start Challenge
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default GuessWhoPage;

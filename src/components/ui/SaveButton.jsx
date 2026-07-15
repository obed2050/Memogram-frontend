import { useState, useEffect, useCallback } from 'react';
import { HiBookmark } from 'react-icons/hi2';
import { savedItemService } from '../../services';
import { cn } from '../../utils';
import toast from 'react-hot-toast';

const SaveButton = ({ itemType, itemId, onToggle, className, size = 'md' }) => {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await savedItemService.check(itemType, itemId);
        if (!cancelled) setSaved(res.data.saved);
      } catch {}
    };
    if (itemId) check();
    return () => { cancelled = true; };
  }, [itemType, itemId]);

  const toggle = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      if (saved) {
        await savedItemService.unsave(itemType, itemId);
        setSaved(false);
        toast.success('Removed from saved');
      } else {
        await savedItemService.save(itemType, itemId);
        setSaved(true);
        toast.success('Saved');
      }
      onToggle?.(!saved);
    } catch {
      toast.error('Failed to update saved status');
    } finally {
      setLoading(false);
    }
  }, [saved, loading, itemType, itemId, onToggle]);

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        'transition-all disabled:opacity-50',
        saved ? 'text-primary' : 'text-gray-400 hover:text-primary/70',
        className
      )}
    >
      <HiBookmark className={cn(sizes[size], saved && 'fill-current')} />
    </button>
  );
};

export default SaveButton;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiEye, HiTrash, HiQuestionMarkCircle,
} from 'react-icons/hi2';
import { guessWhoService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';
import GuessWhoCountdown from './GuessWhoCountdown';
import { formatDate } from '../../utils';
import toast from 'react-hot-toast';

const GuessWhoCard = ({ challenge, onDelete }) => {
  const { user } = useAuth();
  const [guessing, setGuessing] = useState(false);
  const [guessInput, setGuessInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const isOwner = challenge.userId === user?.id;
  const isRevealed = challenge.status === 'revealed';

  const handleSearch = async (q) => {
    if (!q.trim()) { setSearchResults([]); return; }
    try {
      setSearching(true);
      const { searchService } = await import('../../services');
      const res = await searchService.searchUsers({ q, limit: 5 });
      setSearchResults(res.data.users || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleGuess = async (guessedUser) => {
    try {
      await guessWhoService.makeGuess(challenge.id, { guessedUserId: guessedUser.id });
      toast.success(`You guessed ${guessedUser.fullName}!`);
      setGuessing(false);
      setGuessInput('');
      setSearchResults([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit guess');
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this challenge?')) return;
    try {
      await guessWhoService.delete(challenge.id);
      onDelete?.(challenge.id);
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
      {/* Photo */}
      <div className="relative aspect-[4/3] bg-dark-surface overflow-hidden">
        <img
          src={challenge.photo}
          alt="Guess who?"
          className="w-full h-full object-cover"
        />

        {!isRevealed && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          {isRevealed ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 backdrop-blur-sm text-green-400 rounded-full text-xs font-semibold border border-green-500/30">
              Revealed
            </span>
          ) : (
            <GuessWhoCountdown revealAt={challenge.revealAt} compact />
          )}
        </div>

        {/* Guesses Count */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white/80 rounded-full text-xs font-medium">
            <HiQuestionMarkCircle className="w-3.5 h-3.5" />
            {challenge.guessCount || 0} guesses
          </span>
        </div>

        {/* Hint */}
        {challenge.hint && !isRevealed && (
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-xs text-white/70 italic bg-black/40 backdrop-blur-sm rounded-xl px-3 py-2">
              Hint: {challenge.hint}
            </p>
          </div>
        )}

        {/* Revealed Author */}
        {isRevealed && challenge.author && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-black/60 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center gap-3 border border-white/10">
              <Avatar src={challenge.author.profilePhoto} name={challenge.author.fullName} size="sm" />
              <div>
                <p className="text-[10px] text-white/50 uppercase font-semibold tracking-wider">This was</p>
                <p className="text-sm font-bold text-white">{challenge.author.fullName}</p>
              </div>
              {challenge.winningPick && (
                <div className="ml-auto px-2.5 py-1 bg-accent/20 rounded-full">
                  <p className="text-[10px] text-accent-light font-semibold">
                    {challenge.winningPick.guesser.fullName} guessed right!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">{formatDate(challenge.createdAt)}</p>
          <div className="flex items-center gap-2">
            {isOwner && (
              <button
                onClick={handleDelete}
                className="p-1.5 rounded-lg hover:bg-dark-surface text-gray-500 hover:text-red-400 transition-colors"
              >
                <HiTrash className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Guess Button */}
        {!isRevealed && !isOwner && !challenge.myPick && (
          <div className="mt-3">
            {guessing ? (
              <div className="space-y-2">
                <div className="relative">
                  <input
                    value={guessInput}
                    onChange={(e) => {
                      setGuessInput(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    placeholder="Search for a user..."
                    className="w-full bg-dark-surface border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                    autoFocus
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                {searchResults.length > 0 && (
                  <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden">
                    {searchResults.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleGuess(u)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-dark-hover transition-colors text-left"
                      >
                        <Avatar src={u.profilePhoto} name={u.fullName} size="xs" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{u.fullName}</p>
                          <p className="text-xs text-gray-500">@{u.username}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => { setGuessing(false); setGuessInput(''); setSearchResults([]); }}
                  className="text-xs text-gray-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setGuessing(true)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/20 text-sm font-semibold text-primary-light hover:from-primary/30 hover:to-accent/30 transition-all"
              >
                Make a Guess
              </button>
            )}
          </div>
        )}

        {/* Already Guessed */}
        {!isRevealed && challenge.myPick && (
          <div className="mt-3 py-2.5 rounded-xl bg-dark-surface text-center">
            <p className="text-xs text-gray-400">You already made your guess</p>
          </div>
        )}

        {/* View Detail */}
        <Link
          to={`/guess-who/${challenge.id}`}
          className="mt-3 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-dark-surface transition-colors"
        >
          <HiEye className="w-3.5 h-3.5" />
          View Details
        </Link>
      </div>
    </div>
  );
};

export default GuessWhoCard;

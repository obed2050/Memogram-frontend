import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  HiArrowLeft, HiTrash, HiQuestionMarkCircle, HiCheckCircle,
} from 'react-icons/hi2';
import { guessWhoService, searchService } from '../services';
import { useAuth } from '../contexts/AuthContext';
import GuessWhoCountdown from '../components/guess-who/GuessWhoCountdown';
import Avatar from '../components/ui/Avatar';
import { formatDate } from '../utils';
import toast from 'react-hot-toast';

const GuessWhoDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guesses, setGuesses] = useState([]);
  const [guessesLoading, setGuessesLoading] = useState(false);
  const [guessing, setGuessing] = useState(false);
  const [guessInput, setGuessInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [revealAnim, setRevealAnim] = useState(false);

  const isOwner = challenge?.userId === user?.id;
  const isRevealed = challenge?.status === 'revealed';

  const fetchChallenge = useCallback(async () => {
    try {
      const res = await guessWhoService.getOne(id);
      setChallenge(res.data.challenge);
      if (res.data.challenge.status === 'revealed' && !challenge?.author) {
        setTimeout(() => setRevealAnim(true), 300);
      }
    } catch {
      toast.error('Failed to load challenge');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchGuesses = useCallback(async () => {
    try {
      setGuessesLoading(true);
      const res = await guessWhoService.getGuesses(id, { limit: 50 });
      setGuesses(res.data.data);
    } catch {
      toast.error('Failed to load guesses');
    } finally {
      setGuessesLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  useEffect(() => {
    if (isRevealed) fetchGuesses();
  }, [isRevealed, fetchGuesses]);

  const handleRevealed = async () => {
    await fetchChallenge();
    await fetchGuesses();
    setRevealAnim(true);
  };

  const handleSearch = async (q) => {
    if (!q.trim()) { setSearchResults([]); return; }
    try {
      setSearching(true);
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
      await guessWhoService.makeGuess(id, { guessedUserId: guessedUser.id });
      toast.success(`You guessed ${guessedUser.fullName}!`);
      setGuessing(false);
      setGuessInput('');
      setSearchResults([]);
      setChallenge((prev) => ({ ...prev, myPick: { guessedUserId: guessedUser.id }, guessCount: (prev.guessCount || 0) + 1 }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit guess');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this challenge?')) return;
    try {
      await guessWhoService.delete(id);
      toast.success('Deleted');
      window.history.back();
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="skeleton h-80 rounded-2xl" />
        <div className="skeleton h-12 rounded-xl" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Challenge not found</p>
        <Link to="/guess-who" className="text-primary-light text-sm mt-2 inline-block">Back to Guess Who</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <Link
        to="/guess-who"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
      >
        <HiArrowLeft className="w-4 h-4" />
        Guess Who
      </Link>

      {/* Photo + Reveal */}
      <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
        <div className="relative aspect-[4/3] bg-dark-surface overflow-hidden">
          <img
            src={challenge.photo}
            alt="Guess who?"
            className={`w-full h-full object-cover transition-all duration-1000 ${isRevealed && revealAnim ? 'scale-105' : ''}`}
          />

          {!isRevealed && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          )}

          {/* Status */}
          <div className="absolute top-3 left-3">
            {isRevealed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 backdrop-blur-sm text-green-400 rounded-full text-sm font-semibold border border-green-500/30">
                <HiCheckCircle className="w-4 h-4" />
                Revealed
              </span>
            ) : (
              <GuessWhoCountdown revealAt={challenge.revealAt} onRevealed={handleRevealed} />
            )}
          </div>

          {/* Guesses Count */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white/80 rounded-full text-sm font-medium">
              <HiQuestionMarkCircle className="w-4 h-4" />
              {challenge.guessCount || 0} guesses
            </span>
          </div>

          {/* Hint */}
          {challenge.hint && !isRevealed && (
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-sm text-white/70 italic bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2.5">
                Hint: {challenge.hint}
              </p>
            </div>
          )}

          {/* REVEAL ANIMATION OVERLAY */}
          {isRevealed && revealAnim && challenge.author && (
            <div className="absolute inset-0 flex items-end justify-center pb-4 animate-fade-in">
              <div className="bg-black/70 backdrop-blur-xl rounded-2xl px-6 py-4 flex items-center gap-4 border border-white/10 animate-scale-in">
                <div className="relative">
                  <Avatar src={challenge.author.profilePhoto} name={challenge.author.fullName} size="lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center border-2 border-black">
                    <HiCheckCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase font-semibold tracking-wider mb-0.5">This was</p>
                  <p className="text-lg font-bold text-white">{challenge.author.fullName}</p>
                  <p className="text-xs text-gray-400">@{challenge.author.username}</p>
                </div>
              </div>
            </div>
          )}

          {/* Revealed Winner Badge */}
          {isRevealed && challenge.winningPick && (
            <div className="absolute bottom-3 left-3 right-3">
              <div className="bg-accent/20 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center gap-3 border border-accent/30 animate-slide-up">
                <div className="w-8 h-8 bg-accent/30 rounded-full flex items-center justify-center">
                  <HiCheckCircle className="w-5 h-5 text-accent-light" />
                </div>
                <div>
                  <p className="text-xs text-accent-light/70 uppercase font-semibold tracking-wider">Correct guess by</p>
                  <p className="text-sm font-bold text-white">{challenge.winningPick.guesser.fullName}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{formatDate(challenge.createdAt)}</span>
            {challenge.school && <span>&middot; {challenge.school.name}</span>}
          </div>
          {isOwner && (
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-dark-surface text-gray-500 hover:text-red-400 transition-colors"
            >
              <HiTrash className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Guess Section — only when active and not owner */}
      {!isRevealed && !isOwner && (
        <div className="bg-dark-card rounded-2xl border border-dark-border p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Make Your Guess</h3>
          {challenge.myPick ? (
            <div className="py-3 text-center">
              <p className="text-sm text-gray-400">You already made your guess</p>
            </div>
          ) : guessing ? (
            <div className="space-y-2">
              <div className="relative">
                <input
                  value={guessInput}
                  onChange={(e) => { setGuessInput(e.target.value); handleSearch(e.target.value); }}
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
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/20 text-sm font-semibold text-primary-light hover:from-primary/30 hover:to-accent/30 transition-all"
            >
              Make a Guess
            </button>
          )}
        </div>
      )}

      {/* Guess List — only when revealed */}
      {isRevealed && (
        <div className="bg-dark-card rounded-2xl border border-dark-border p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            Guesses ({guesses.length})
          </h3>
          {guessesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
            </div>
          ) : guesses.length > 0 ? (
            <div className="space-y-2">
              {guesses.map((g) => (
                <div
                  key={g.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    g.isCorrect ? 'bg-accent/10 border border-accent/20' : 'bg-dark-surface'
                  }`}
                >
                  <Avatar src={g.guesser?.profilePhoto} name={g.guesser?.fullName} size="xs" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      <span className="font-medium">{g.guesser?.fullName}</span>
                      <span className="text-gray-500"> guessed </span>
                      {g.guessedUser ? (
                        <span className="font-medium">{g.guessedUser.fullName}</span>
                      ) : (
                        <span className="text-gray-500 italic">someone</span>
                      )}
                    </p>
                  </div>
                  {g.isCorrect && (
                    <span className="px-2 py-0.5 bg-accent/20 text-accent-light text-xs font-semibold rounded-full">
                      Correct!
                    </span>
                  )}
                  {!g.isCorrect && (
                    <span className="px-2 py-0.5 bg-dark-hover text-gray-500 text-xs rounded-full">
                      Wrong
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-sm py-4">No guesses yet</p>
          )}
        </div>
      )}

      {/* Active Guess List — show guesser avatars only */}
      {!isRevealed && guesses.length > 0 && (
        <div className="bg-dark-card rounded-2xl border border-dark-border p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            {guesses.length} people guessed
          </h3>
          <div className="flex flex-wrap gap-2">
            {guesses.map((g) => (
              <div key={g.id} className="flex items-center gap-2 px-2.5 py-1.5 bg-dark-surface rounded-full">
                <Avatar src={g.guesser?.profilePhoto} name={g.guesser?.fullName} size="xs" />
                <span className="text-xs text-gray-300">{g.guesser?.fullName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inline styles for reveal animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.5s ease-out 0.3s forwards; opacity: 0; }
        .animate-slide-up { animation: slideUp 0.4s ease-out 0.6s forwards; opacity: 0; }
      `}</style>
    </div>
  );
};

export default GuessWhoDetailPage;

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiDocumentText, HiPhoto, HiPlay, HiBookmark, HiSquare2Stack,
} from 'react-icons/hi2';
import PostCard from '../feed/PostCard';
import AlbumCard from '../albums/AlbumCard';
import { PostSkeleton } from '../ui/Skeleton';
import { postService, savedItemService, albumService } from '../../services';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'posts', label: 'Posts', icon: HiDocumentText },
  { key: 'memories', label: 'Memories', icon: HiPhoto },
  { key: 'reels', label: 'Reels', icon: HiPlay },
  { key: 'saved', label: 'Saved', icon: HiBookmark },
  { key: 'albums', label: 'Albums', icon: HiSquare2Stack },
];

const EmptyState = ({ tab }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4">
      {(() => {
        const tabObj = TABS.find((t) => t.key === tab);
        const Icon = tabObj?.icon || HiDocumentText;
        return <Icon className="w-7 h-7 text-gray-600" />;
      })()}
    </div>
    <p className="text-gray-500 text-sm text-center">
      {tab === 'saved' && 'No saved items yet'}
      {tab === 'albums' && 'No albums yet'}
      {tab === 'posts' && 'No posts yet'}
      {tab === 'memories' && 'No memories yet'}
      {tab === 'reels' && 'No reels yet'}
    </p>
  </div>
);

const ProfileTabs = ({ userId, isOwnProfile, onDeletePost }) => {
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [loadingAlbums, setLoadingAlbums] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await postService.getUserPosts(userId, { page: 1, limit: 50 });
      setPosts(res.data.data);
    } catch {} finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchSaved = useCallback(async () => {
    try {
      setLoadingSaved(true);
      const res = await savedItemService.getSaved({ page: 1, limit: 50 });
      setSavedItems(res.data.data || res.data.saved || []);
    } catch {} finally {
      setLoadingSaved(false);
    }
  }, []);

  const fetchAlbums = useCallback(async () => {
    try {
      setLoadingAlbums(true);
      const res = await albumService.getMyAlbums({ page: 1, limit: 50 });
      setAlbums(res.data.data || res.data.albums || []);
    } catch {} finally {
      setLoadingAlbums(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => {
    if (activeTab === 'saved' && savedItems.length === 0) fetchSaved();
    if (activeTab === 'albums' && albums.length === 0) fetchAlbums();
  }, [activeTab, fetchSaved, fetchAlbums, savedItems.length, albums.length]);

  const getFilteredPosts = () => {
    if (activeTab === 'posts') return posts.filter((p) => p.type === 'post');
    if (activeTab === 'memories') return posts.filter((p) => p.type === 'memory');
    if (activeTab === 'reels') return posts.filter((p) => p.type === 'reel');
    return [];
  };

  const filteredPosts = getFilteredPosts();
  const isContentTab = ['posts', 'memories', 'reels'].includes(activeTab);
  const isLoading = isContentTab ? loading : activeTab === 'saved' ? loadingSaved : loadingAlbums;

  return (
    <div className="space-y-0">
      {/* Tab Bar */}
      <div className="flex border-b border-dark-border bg-dark-card/50 backdrop-blur-sm sticky top-0 z-10">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-medium transition-colors ${
                isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="profile-tab-indicator"
                  className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-primary via-primary-light to-accent"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {isLoading ? (
            <div className="space-y-4 p-4">
              {[1, 2].map((i) => <PostSkeleton key={i} />)}
            </div>
          ) : isContentTab ? (
            filteredPosts.length > 0 ? (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} onDelete={onDeletePost} />
                ))}
              </div>
            ) : (
              <EmptyState tab={activeTab} />
            )
          ) : activeTab === 'saved' ? (
            savedItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                {savedItems.map((item) => (
                  <PostCard key={item.id} post={item} />
                ))}
              </div>
            ) : (
              <EmptyState tab="saved" />
            )
          ) : activeTab === 'albums' ? (
            albums.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
                {albums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            ) : (
              <EmptyState tab="albums" />
            )
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProfileTabs;

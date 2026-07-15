import { useState, useRef } from 'react';
import { HiPhoto, HiFilm, HiCalendarDays } from 'react-icons/hi2';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';
import { postService, draftService } from '../../services';
import toast from 'react-hot-toast';

const CreatePost = ({ onPostCreated, clubId }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [postType, setPostType] = useState('post');
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles].slice(0, 10));
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('type', postType);
      if (clubId) formData.append('clubId', clubId);
      files.forEach((file) => formData.append('media', file));
      await postService.createPost(formData);
      toast.success(postType === 'reel' ? 'Reel created!' : postType === 'memory' ? 'Memory created!' : 'Post created!');
      setContent('');
      setFiles([]);
      setIsOpen(false);
      onPostCreated?.();
    } catch (err) {
      toast.error(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card-solid p-4">
      <div className="flex items-center gap-3">
        <Avatar src={user?.profilePhoto} name={user?.fullName} />
        <button
          onClick={() => setIsOpen(true)}
          className="flex-1 text-left px-4 py-3 rounded-2xl bg-dark-surface text-gray-500 text-sm hover:bg-dark-hover hover:text-gray-400 transition-all border border-dark-border"
        >
          Share a memory, {user?.fullName?.split(' ')[0]}...
        </button>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dark-border">
        <button
          onClick={() => { setPostType('post'); setIsOpen(true); }}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-gray-500 hover:bg-dark-surface hover:text-green-400 text-sm transition-all"
        >
          <HiPhoto className="w-5 h-5" />
          <span>Photo</span>
        </button>
        <button
          onClick={() => { setPostType('reel'); setIsOpen(true); }}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-gray-500 hover:bg-dark-surface hover:text-red-400 text-sm transition-all"
        >
          <HiFilm className="w-5 h-5" />
          <span>Reel</span>
        </button>
        <button
          onClick={() => { setPostType('memory'); setIsOpen(true); }}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-gray-500 hover:bg-dark-surface hover:text-accent text-sm transition-all"
        >
          <HiCalendarDays className="w-5 h-5" />
          <span>Memory</span>
        </button>
      </div>

      {/* Expanded Create */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-dark-border animate-fade-in-up">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full bg-transparent text-white placeholder-gray-500 text-sm resize-none min-h-[100px] focus:outline-none"
            autoFocus
          />

          {files.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {files.map((file, i) => (
                <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-dark-border">
                  {file.type.startsWith('video/') ? (
                    <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                  ) : (
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/70 rounded-full flex items-center justify-center text-white text-[10px]"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <input ref={fileRef} type="file" accept="image/*,video/*" multiple onChange={handleFileChange} className="hidden" />
              <button
                onClick={() => fileRef.current?.click()}
                className="p-2 rounded-xl text-gray-500 hover:text-green-400 hover:bg-green-400/10 transition-all"
              >
                <HiPhoto className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setIsOpen(false); setContent(''); setFiles([]); }}
                className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:bg-dark-surface transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || (!content.trim() && files.length === 0)}
                className="px-5 py-2 rounded-xl text-sm font-medium btn-primary text-white disabled:opacity-50 transition-all"
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePost;

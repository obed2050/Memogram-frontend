import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiPhoto, HiFilm, HiCalendarDays, HiDocumentArrowUp, HiXMark } from 'react-icons/hi2';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { postService, draftService } from '../../services';
import toast from 'react-hot-toast';

const CreatePostModal = ({ onClose, onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [postType, setPostType] = useState('post');
  const fileRef = useRef(null);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles].slice(0, 10));
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('type', postType);
      files.forEach((file) => formData.append('media', file));

      await postService.createPost(formData);
      toast.success(postType === 'reel' ? 'Reel created!' : postType === 'memory' ? 'Memory created!' : 'Post created!');
      onPostCreated?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!content.trim() && files.length === 0) return;
    setSavingDraft(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('type', postType);
      files.forEach((file) => formData.append('media', file));
      await draftService.createDraft(formData);
      toast.success('Draft saved');
      setFiles([]);
    } catch (err) {
      toast.error(err.message || 'Failed to save draft');
    } finally {
      setSavingDraft(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative w-full max-w-lg bg-dark-card border border-dark-border rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <Avatar src={user?.profilePhoto} name={user?.fullName} size="sm" />
            <div>
              <p className="text-sm font-medium text-white">{user?.fullName}</p>
              <div className="flex gap-1.5">
                {['post', 'reel', 'memory'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setPostType(t)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                      postType === t
                        ? 'bg-primary/15 text-primary-light border border-primary/20'
                        : 'text-gray-500 hover:text-gray-300 border border-transparent'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-dark-surface transition-all"
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${user?.fullName?.split(' ')[0]}?`}
            className="w-full bg-transparent text-white placeholder-gray-500 text-sm resize-none min-h-[140px] focus:outline-none"
            autoFocus
          />

          {/* File Previews */}
          {files.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-3">
              {files.map((file, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-dark-border">
                  {file.type.startsWith('video/') ? (
                    <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                  ) : (
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-colors"
                  >
                    <HiXMark className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-dark-border bg-dark-surface/30">
          <div className="flex items-center gap-1">
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple onChange={handleFileChange} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              className="p-2.5 rounded-xl text-gray-400 hover:text-green-400 hover:bg-green-400/10 transition-all"
            >
              <HiPhoto className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleSaveDraft}
              loading={savingDraft}
              disabled={!content.trim() && files.length === 0}
              size="sm"
            >
              <HiDocumentArrowUp className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleSubmit}
              loading={loading}
              disabled={!content.trim() && files.length === 0}
              size="sm"
              className="px-5"
            >
              Post
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreatePostModal;

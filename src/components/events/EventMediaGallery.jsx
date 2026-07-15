import { useState } from 'react';
import { HiXMark, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

const EventMediaGallery = ({ images = [], videos = [], onRemoveImage, onRemoveVideo, isOwner }) => {
  const [lightbox, setLightbox] = useState({ open: false, index: 0, type: 'image' });

  const allMedia = [
    ...images.map((url) => ({ url, type: 'image' })),
    ...videos.map((url) => ({ url, type: 'video' })),
  ];

  if (allMedia.length === 0) return null;

  const openLightbox = (index, type) => setLightbox({ open: true, index, type });
  const closeLightbox = () => setLightbox({ open: false, index: 0, type: 'image' });

  const navigate = (dir) => {
    const newIndex = (lightbox.index + dir + allMedia.length) % allMedia.length;
    setLightbox({ ...lightbox, index: newIndex, type: allMedia[newIndex].type });
  };

  return (
    <>
      {/* Thumbnail Grid */}
      <div className="space-y-3">
        {images.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2">Images ({images.length})</p>
            <div className="grid grid-cols-3 gap-2">
              {images.map((url, i) => (
                <div key={i} className="relative group cursor-pointer" onClick={() => openLightbox(i, 'image')}>
                  <img src={url} alt="" className="w-full h-28 object-cover rounded-xl" />
                  {isOwner && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemoveImage?.(i); }}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <HiXMark className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {videos.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2">Videos ({videos.length})</p>
            <div className="grid grid-cols-2 gap-2">
              {videos.map((url, i) => (
                <div key={i} className="relative group">
                  <video
                    src={url}
                    className="w-full h-32 object-cover rounded-xl"
                    controls={false}
                    preload="metadata"
                    onClick={() => openLightbox(images.length + i, 'video')}
                  />
                  {isOwner && (
                    <button
                      onClick={() => onRemoveVideo?.(i)}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <HiXMark className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox.open && allMedia[lightbox.index] && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4" onClick={closeLightbox}>
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-10"
          >
            <HiXMark className="w-6 h-6" />
          </button>

          {allMedia.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                className="absolute left-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-10"
              >
                <HiChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigate(1); }}
                className="absolute right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-10"
              >
                <HiChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="max-w-4xl max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            {allMedia[lightbox.index].type === 'image' ? (
              <img src={allMedia[lightbox.index].url} alt="" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
            ) : (
              <video src={allMedia[lightbox.index].url} controls autoPlay className="max-w-full max-h-[85vh] rounded-lg" />
            )}
          </div>

          <p className="absolute bottom-4 text-white/60 text-xs">
            {lightbox.index + 1} / {allMedia.length}
          </p>
        </div>
      )}
    </>
  );
};

export default EventMediaGallery;

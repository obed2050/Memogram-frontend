import { Link } from 'react-router-dom';
import { HiPhoto, HiLockClosed, HiUserGroup } from 'react-icons/hi2';

const VISIBILITY_ICON = {
  public: null,
  friends: HiUserGroup,
  private: HiLockClosed,
};

const AlbumCard = ({ album }) => {
  const VisIcon = VISIBILITY_ICON[album.visibility];

  return (
    <Link
      to={`/albums/${album.id}`}
      className="group bg-dark-card rounded-2xl border border-dark-border overflow-hidden hover:border-dark-hover transition-all"
    >
      {/* Cover */}
      <div className="relative aspect-square bg-dark-surface overflow-hidden">
        {album.coverImage ? (
          <img
            src={album.coverImage}
            alt={album.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HiPhoto className="w-12 h-12 text-gray-700" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Count badge */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
            <HiPhoto className="w-3 h-3" />
            {album.postsCount || 0}
          </span>
        </div>

        {/* Visibility */}
        {VisIcon && (
          <div className="absolute top-3 right-3">
            <span className="p-1.5 bg-black/50 backdrop-blur-sm rounded-full">
              <VisIcon className="w-3 h-3 text-white/70" />
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-white truncate">{album.name}</h3>
        {album.description && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{album.description}</p>
        )}
      </div>
    </Link>
  );
};

export default AlbumCard;

import { cn } from '../../utils';

const Skeleton = ({ className, ...props }) => {
  return (
    <div className={cn('skeleton rounded-xl', className)} {...props} />
  );
};

export const PostSkeleton = () => (
  <div className="glass-card-solid p-5 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="w-full h-64 rounded-2xl" />
    <div className="flex items-center gap-4 pt-2 border-t border-dark-border">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-4 w-8" />
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="w-full h-48 rounded-2xl" />
    <div className="flex items-end gap-4 px-6 -mt-10">
      <Skeleton className="w-20 h-20 rounded-full border-4 border-dark" />
      <div className="space-y-2 flex-1 pb-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  </div>
);

export const SidebarSkeleton = () => (
  <div className="space-y-4 p-4">
    <div className="flex items-center gap-3 p-2.5">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-2.5 w-16" />
      </div>
    </div>
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center gap-3 p-2.5">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;

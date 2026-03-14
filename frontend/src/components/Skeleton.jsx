const baseClass =
  'animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-700/70';

export const Skeleton = ({ className = '' }) => {
  return <div className={`${baseClass} ${className}`} />;
};

export const SkeletonText = ({ lines = 3 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          className={`h-3 ${idx === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm dark:bg-slate-900">
      <div className="mb-4 flex items-start justify-between">
        <div className="space-y-3">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
      <Skeleton className="mb-3 h-4 w-40 rounded-full" />
      <Skeleton className="h-6 w-full" />
    </div>
  );
};

export const SkeletonTableRows = ({ rows = 5, cols = 3 }) => {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }).map((__, colIdx) => (
            <Skeleton key={colIdx} className="h-10 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
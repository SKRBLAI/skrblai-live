'use client';

export function ActivityFeedSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-start gap-3 p-3 bg-black/40 rounded-lg border border-gray-700">
          {/* Avatar skeleton */}
          <div className="flex-shrink-0 w-8 h-8 bg-gray-700 rounded-full" />

          {/* Content skeleton */}
          <div className="flex-grow space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 bg-gray-700 rounded" />
              <div className="h-4 w-16 bg-gray-700 rounded-full" />
            </div>
            <div className="h-3 w-full bg-gray-700 rounded" />
            <div className="h-3 w-32 bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivityFeedSkeletonCompact() {
  return (
    <div className="space-y-2 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 p-2 bg-black/40 rounded-lg border border-gray-700">
          <div className="w-6 h-6 bg-gray-700 rounded-full" />
          <div className="flex-grow space-y-1">
            <div className="h-3 w-20 bg-gray-700 rounded" />
            <div className="h-2 w-full bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

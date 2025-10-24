'use client';

export function ActivityFeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="
            bg-[rgba(21,23,30,0.50)] 
            border border-teal-400/20
            rounded-lg p-4
            backdrop-blur-sm
            animate-pulse
          "
        >
          <div className="flex items-start gap-3">
            {/* Avatar Skeleton */}
            <div className="w-10 h-10 rounded-full bg-gray-700/50" />

            {/* Content Skeleton */}
            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-gray-700/50 rounded" />
                <div className="h-3 w-16 bg-gray-700/50 rounded" />
              </div>

              {/* Message */}
              <div className="h-3 w-full bg-gray-700/50 rounded" />
              <div className="h-3 w-3/4 bg-gray-700/50 rounded" />

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="h-6 w-20 bg-gray-700/50 rounded-full" />
                <div className="h-5 w-16 bg-gray-700/50 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

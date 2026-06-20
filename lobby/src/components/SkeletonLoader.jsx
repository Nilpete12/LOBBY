/**
 * Skeleton Loader Component for Loading States
 * Provides visual feedback while data is loading
 */

export function RideCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
      <div className="flex gap-4">
        {/* Profile Photo Skeleton */}
        <div className="w-16 h-16 rounded-full bg-slate-200 shrink-0" />
        
        <div className="flex-1 space-y-3">
          {/* Name & Rating Skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-32" />
            <div className="h-3 bg-slate-200 rounded w-24" />
          </div>
          
          {/* Car Photo Skeleton */}
          <div className="mt-3 w-full h-32 rounded-xl bg-slate-200" />
          
          {/* Routes Skeleton */}
          <div className="h-3 bg-slate-200 rounded w-40" />
        </div>
        
        {/* Call Button Skeleton */}
        <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
      </div>
    </div>
  );
}

export function SearchResultsSkeletons({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <RideCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-3 bg-slate-200 rounded w-20" />
      <div className="h-10 bg-slate-200 rounded-lg" />
    </div>
  );
}

export function DashboardStatSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-24 mb-4" />
      <div className="h-8 bg-slate-200 rounded w-16" />
    </div>
  );
}

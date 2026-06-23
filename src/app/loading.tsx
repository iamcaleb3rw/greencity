import { CardSkeleton, AnalyticsSkeleton, MapSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav skeleton */}
      <div className="h-14 bg-white border-b border-gray-100" />
      <div className="h-20 bg-forest-900" />

      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-[420px] space-y-5">
            <AnalyticsSkeleton />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          </div>
          <div className="flex-1">
            <MapSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

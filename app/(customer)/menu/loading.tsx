import { Skeleton, CardSkeleton } from "@/components/skeleton";

export default function MenuLoading() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-5 w-72" />
      </div>

      {/* Category pills */}
      <div className="mb-8 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-full" />
        ))}
      </div>

      {/* Section */}
      <div className="space-y-10">
        {Array.from({ length: 2 }).map((_, s) => (
          <div key={s}>
            <Skeleton className="mb-4 h-6 w-32" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

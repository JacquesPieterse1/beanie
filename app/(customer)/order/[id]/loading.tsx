import { Skeleton } from "@/components/skeleton";

export default function OrderLoading() {
  return (
    <div className="mx-auto max-w-lg">
      {/* Pickup code */}
      <div className="mb-8 flex flex-col items-center">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-2 h-16 w-48 rounded-2xl" />
        <Skeleton className="mt-3 h-4 w-56" />
      </div>

      {/* Status steps */}
      <Skeleton className="mb-8 h-28 w-full rounded-2xl" />

      {/* Items */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>

      {/* Total */}
      <Skeleton className="mt-4 h-16 w-full rounded-2xl" />
    </div>
  );
}

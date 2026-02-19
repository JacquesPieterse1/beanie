import { Skeleton, TableRowSkeleton } from "@/components/skeleton";

export default function AdminOrdersLoading() {
  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-9 flex-1 rounded-xl" />
        <Skeleton className="h-9 w-36 rounded-xl" />
        <Skeleton className="h-9 w-36 rounded-xl" />
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {Array.from({ length: 8 }).map((_, i) => (
          <TableRowSkeleton key={i} cols={5} />
        ))}
      </div>
    </div>
  );
}

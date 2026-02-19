import { Skeleton, TableRowSkeleton } from "@/components/skeleton";

export default function AdminMenuLoading() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-56" />
          <Skeleton className="mt-2 h-5 w-28" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      <Skeleton className="mb-6 h-9 w-full rounded-xl" />

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {Array.from({ length: 6 }).map((_, i) => (
          <TableRowSkeleton key={i} cols={5} />
        ))}
      </div>
    </div>
  );
}

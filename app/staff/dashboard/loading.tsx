import { Skeleton } from "@/components/skeleton";

export default function StaffDashboardLoading() {
  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-5 w-32" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, col) => (
          <div key={col}>
            <div className="mb-4 flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

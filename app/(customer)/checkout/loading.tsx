import { Skeleton } from "@/components/skeleton";

export default function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-lg">
      <Skeleton className="mb-2 h-4 w-28" />
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-2 h-5 w-64" />

      <div className="mt-8 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>

      <Skeleton className="mt-6 h-20 w-full rounded-2xl" />
      <Skeleton className="mt-6 h-12 w-full rounded-xl" />
    </div>
  );
}

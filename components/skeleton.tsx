import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-muted",
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 border-b border-border px-6 py-4">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === 0 ? "w-32" : "w-20")}
        />
      ))}
    </div>
  );
}

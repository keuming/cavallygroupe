import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
  variant?: "text" | "card" | "table" | "avatar";
}

export function SkeletonLoader({
  className,
  count = 1,
  variant = "text",
}: SkeletonLoaderProps) {
  const baseClasses = "bg-muted animate-pulse rounded";

  const variants = {
    text: "h-4 w-full mb-2",
    card: "h-32 w-full mb-4 rounded-lg",
    table: "h-10 w-full mb-2",
    avatar: "h-12 w-12 rounded-full",
  };

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(baseClasses, variants[variant])}
          style={{
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-4 border-b">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`header-${i}`}
            className="h-4 bg-muted rounded animate-pulse flex-1"
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={`row-${rowIdx}`} className="flex gap-4">
          {Array.from({ length: 4 }).map((_, colIdx) => (
            <div
              key={`cell-${rowIdx}-${colIdx}`}
              className="h-10 bg-muted rounded animate-pulse flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-8 bg-muted rounded animate-pulse flex-1" />
        <div className="h-8 bg-muted rounded animate-pulse flex-1" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

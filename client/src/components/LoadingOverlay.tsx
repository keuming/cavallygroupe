import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export function LoadingOverlay({
  isLoading,
  message = "Chargement...",
  fullScreen = false,
  className,
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 p-4",
        fullScreen && "fixed inset-0 bg-background/80 backdrop-blur-sm z-50",
        !fullScreen && "py-8",
        className
      )}
    >
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
}

export function LoadingSpinner({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <Loader2
      className={cn(
        "animate-spin text-primary",
        sizeClasses[size],
        className
      )}
    />
  );
}

export function LoadingPulse({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <div className="relative h-12 w-12 mb-4">
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
        <div className="absolute inset-2 rounded-full bg-primary/40 animate-pulse animation-delay-100" />
        <div className="absolute inset-4 rounded-full bg-primary animate-pulse animation-delay-200" />
      </div>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

export function ProgressBar({
  progress,
  showLabel = true,
  className,
}: {
  progress: number;
  showLabel?: boolean;
  className?: string;
}) {
  const percentage = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-muted-foreground text-right">{percentage}%</p>
      )}
    </div>
  );
}

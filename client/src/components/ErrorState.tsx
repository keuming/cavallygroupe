import { cn } from "@/lib/utils";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
  onHome?: () => void;
  showDetails?: boolean;
  className?: string;
}

export function ErrorState({
  title = "Une erreur s'est produite",
  message = "Nous n'avons pas pu traiter votre demande. Veuillez réessayer.",
  error,
  onRetry,
  onHome,
  showDetails = false,
  className,
}: ErrorStateProps) {
  const errorMessage = typeof error === "string" ? error : error?.message;

  return (
    <div className={cn("flex items-center justify-center min-h-screen p-4", className)}>
      <Card className="w-full max-w-md border-destructive/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
            <CardTitle className="text-destructive">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{message}</p>

          {showDetails && errorMessage && (
            <div className="bg-muted p-3 rounded-lg text-xs font-mono overflow-auto max-h-32">
              <p className="text-destructive/80">{errorMessage}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="default"
                size="sm"
                className="flex-1 gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </Button>
            )}
            {onHome && (
              <Button
                onClick={onHome}
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
              >
                <Home className="h-4 w-4" />
                Accueil
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ErrorAlert({
  title,
  message,
  onDismiss,
  className,
}: {
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border border-destructive/50 bg-destructive/5",
        className
      )}
    >
      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <p className="font-semibold text-destructive text-sm">{title}</p>}
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title = "Aucune donnée",
  message = "Il n'y a rien à afficher pour le moment.",
  icon: Icon,
  action,
  className,
}: {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: { label: string; onClick: () => void };
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
      {Icon && <div className="mb-4 text-muted-foreground">{Icon}</div>}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">{message}</p>
      {action && (
        <Button onClick={action.onClick} variant="outline" size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}

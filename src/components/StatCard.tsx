import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  loading,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: LucideIcon;
  loading?: boolean;
  className?: string;
}) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0 space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className={cn("truncate text-2xl font-semibold tabular-nums", className)}>{value}</p>
          )}
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

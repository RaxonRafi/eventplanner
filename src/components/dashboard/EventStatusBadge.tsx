import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STYLES: Record<string, { label: string; className: string }> = {
  APPROVED: { label: "Live", className: "bg-green-500/15 text-green-700 dark:text-green-400" },
  PENDING: { label: "In review", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  REJECTED: { label: "Rejected", className: "bg-red-500/15 text-red-700 dark:text-red-400" },
};

export function EventStatusBadge({ status, className }: { status: string; className?: string }) {
  const s = STYLES[status] ?? { label: status, className: "bg-muted text-muted-foreground" };
  return (
    <Badge variant="outline" className={cn("border-0", s.className, className)}>
      {s.label}
    </Badge>
  );
}

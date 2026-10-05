import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const TONES = {
  green: "border-success/30 bg-success/10 text-success",
  amber: "border-warning/30 bg-warning/10 text-warning",
  red: "border-destructive/30 bg-destructive/10 text-destructive",
  blue: "border-info/30 bg-info/10 text-info",
  violet: "border-highlight/30 bg-highlight/10 text-highlight",
  muted: "border-border bg-muted text-muted-foreground",
};

export type StatusTone = keyof typeof TONES;

/** Rounded, tinted status label used across the dashboard tables. */
export function StatusPill({
  tone,
  icon: Icon,
  className,
  children,
}: {
  tone: StatusTone;
  icon?: LucideIcon;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Badge variant="outline" className={cn("rounded-full px-2.5 py-0.5 font-semibold", TONES[tone], className)}>
      {Icon && <Icon />}
      {children}
    </Badge>
  );
}

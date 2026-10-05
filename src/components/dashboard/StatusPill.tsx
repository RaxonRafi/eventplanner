import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const TONES = {
  green: "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  red: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
  blue: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  violet: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
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

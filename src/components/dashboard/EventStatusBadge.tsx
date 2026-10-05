import { StatusPill, type StatusTone } from "@/components/dashboard/StatusPill";
import { CircleCheck, CircleX, Clock, type LucideIcon } from "lucide-react";

const STYLES: Record<string, { label: string; tone: StatusTone; icon: LucideIcon }> = {
  APPROVED: { label: "Live", tone: "green", icon: CircleCheck },
  PENDING: { label: "In review", tone: "amber", icon: Clock },
  REJECTED: { label: "Rejected", tone: "red", icon: CircleX },
};

export function EventStatusBadge({ status, className }: { status: string; className?: string }) {
  const s = STYLES[status];
  if (!s) {
    return (
      <StatusPill tone="muted" className={className}>
        {status}
      </StatusPill>
    );
  }
  return (
    <StatusPill tone={s.tone} icon={s.icon} className={className}>
      {s.label}
    </StatusPill>
  );
}

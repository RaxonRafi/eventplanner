"use client";

import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBDT, PLATFORM_FEE_RATE } from "@/lib/fees";
import { cn } from "@/lib/utils";
import {
  type PaymentStatus,
  usePaymentsQuery,
} from "@/redux/features/Payment/payment.api";
import { useUserInfoQuery } from "@/redux/features/User/user.api";
import { CircleCheck, CircleX, Landmark, Wallet } from "lucide-react";
import { useState } from "react";

type PaymentRow = {
  id: string;
  tranId: string | null;
  amount: number;
  platformFee: number;
  organizerAmount: number;
  status: PaymentStatus;
  createdAt: string;
  rsvp: {
    user: { name: string | null; email: string };
    event: { id: string; title: string };
    package: { name: string } | null;
  };
};

const TABS: { label: string; value?: PaymentStatus }[] = [
  { label: "All" },
  { label: "Successful", value: "PAID" },
  { label: "Failed", value: "FAILED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Pending", value: "UNPAID" },
];

const STATUS_STYLE: Record<PaymentStatus, string> = {
  PAID: "bg-green-500/15 text-green-700 dark:text-green-400",
  FAILED: "bg-red-500/15 text-red-700 dark:text-red-400",
  CANCELLED: "bg-muted text-muted-foreground",
  UNPAID: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  REFUNDED: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
};

export default function PaymentsPage() {
  const [status, setStatus] = useState<PaymentStatus | undefined>("PAID");
  const [page, setPage] = useState(1);
  const { data: me } = useUserInfoQuery(undefined);
  const isAdmin = me?.data?.role === "ADMIN";
  const { data, isLoading, isFetching, isError } = usePaymentsQuery({
    status,
    page,
    limit: 15,
  });

  const rows: PaymentRow[] = data?.data ?? [];
  const summary = data?.summary;
  const counts: Record<string, number> = summary?.counts ?? {};
  const totalPages: number = data?.meta?.totalPages ?? 1;
  const feePct = `${PLATFORM_FEE_RATE * 100}%`;

  return (
    <SidebarInset>
      <PageHeader title="Payments" />

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Gross sales"
            value={formatBDT(summary?.gross ?? 0)}
            hint="All successful payments"
            icon={Wallet}
            loading={isLoading}
          />
          <StatCard
            label={isAdmin ? "Platform earnings" : "Platform fee"}
            value={formatBDT(summary?.platformFee ?? 0)}
            hint={`${feePct} of every booking`}
            icon={Landmark}
            loading={isLoading}
          />
          <StatCard
            label={isAdmin ? "Organizer payouts" : "Your earnings"}
            value={formatBDT(summary?.organizerAmount ?? 0)}
            hint="After platform fee"
            icon={CircleCheck}
            className="text-green-600 dark:text-green-400"
            loading={isLoading}
          />
          <StatCard
            label="Failed payments"
            value={counts.FAILED ?? 0}
            hint={`${counts.CANCELLED ?? 0} cancelled`}
            icon={CircleX}
            className="text-red-600 dark:text-red-400"
            loading={isLoading}
          />
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Transactions</CardTitle>
            <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
              {TABS.map((t) => (
                <button
                  key={t.label}
                  onClick={() => {
                    setStatus(t.value);
                    setPage(1);
                  }}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    status === t.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                  {t.value && counts[t.value] != null && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      {counts[t.value]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {isError ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Failed to load payments.
              </p>
            ) : (
              <div className={cn("overflow-x-auto", isFetching && "opacity-60")}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="h-10 px-3 font-medium">Customer</th>
                      <th className="h-10 px-3 font-medium">Event</th>
                      <th className="h-10 px-3 font-medium">Status</th>
                      <th className="h-10 px-3 text-right font-medium">Amount</th>
                      <th className="h-10 px-3 text-right font-medium">Fee ({feePct})</th>
                      <th className="h-10 px-3 text-right font-medium">Organizer</th>
                      <th className="h-10 px-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b">
                          <td colSpan={7} className="p-3">
                            <Skeleton className="h-6 w-full" />
                          </td>
                        </tr>
                      ))
                    ) : rows.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-muted-foreground">
                          No payments found.
                        </td>
                      </tr>
                    ) : (
                      rows.map((p) => (
                        <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="p-3">
                            <p className="font-medium">{p.rsvp.user.name ?? "—"}</p>
                            <p className="text-xs text-muted-foreground">{p.rsvp.user.email}</p>
                          </td>
                          <td className="p-3">
                            <p>{p.rsvp.event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {p.rsvp.package?.name ?? "—"}
                            </p>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className={cn("border-0", STATUS_STYLE[p.status])}>
                              {p.status === "PAID" ? "Successful" : p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                            </Badge>
                          </td>
                          <td className="p-3 text-right tabular-nums">{formatBDT(p.amount)}</td>
                          <td className="p-3 text-right tabular-nums text-muted-foreground">
                            {formatBDT(p.platformFee)}
                          </td>
                          <td className="p-3 text-right tabular-nums">{formatBDT(p.organizerAmount)}</td>
                          <td className="whitespace-nowrap p-3 text-muted-foreground">
                            {new Date(p.createdAt).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-end gap-2">
                <span className="mr-2 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  );
}

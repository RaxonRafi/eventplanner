"use client";

import { StatCard } from "@/components/StatCard";
import {
  FilterPill,
  TableCard,
  TableMessage,
  TableSearch,
  TableSkeletonRows,
  TableToolbar,
} from "@/components/dashboard/DataTable";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusPill, type StatusTone } from "@/components/dashboard/StatusPill";
import { Pagination } from "@/components/ui/pagination";
import { SidebarInset } from "@/components/ui/sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { oneOf, usePageParams, useQueryParams, useSearchParam } from "@/hooks/use-query-params";
import { formatBDT, PLATFORM_FEE_RATE } from "@/lib/fees";
import {
  type PaymentStatus,
  usePaymentsQuery,
} from "@/redux/features/Payment/payment.api";
import { useUserInfoQuery } from "@/redux/features/User/user.api";
import { Ban, CircleCheck, CircleX, Clock, Landmark, ListFilter, type LucideIcon, Undo2, Wallet } from "lucide-react";

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

const STATUSES: { label: string; value?: PaymentStatus }[] = [
  { label: "All statuses" },
  { label: "Successful", value: "PAID" },
  { label: "Failed", value: "FAILED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Pending", value: "UNPAID" },
];

const ALL_STATUSES = "ALL";

const STATUS_STYLE: Record<PaymentStatus, { tone: StatusTone; icon: LucideIcon }> = {
  PAID: { tone: "green", icon: CircleCheck },
  FAILED: { tone: "red", icon: CircleX },
  CANCELLED: { tone: "muted", icon: Ban },
  UNPAID: { tone: "amber", icon: Clock },
  REFUNDED: { tone: "blue", icon: Undo2 },
};

export default function PaymentsPage() {
  const { searchParams, setParams } = useQueryParams();
  // Successful payments by default; ?status=ALL shows every status
  const statusParam = searchParams.get("status");
  const status: PaymentStatus | undefined =
    statusParam === ALL_STATUSES ? undefined : oneOf(statusParam, STATUSES.map((s) => s.value)) ?? "PAID";
  const { page, pageSize } = usePageParams();
  const { q, input, setInput } = useSearchParam();
  const { data: me } = useUserInfoQuery(undefined);
  const isAdmin = me?.data?.role === "ADMIN";
  const { data, isLoading, isFetching, isError } = usePaymentsQuery({
    status,
    page,
    limit: pageSize,
    q: q || undefined,
  });

  const rows: PaymentRow[] = data?.data ?? [];
  const summary = data?.summary;
  const counts: Record<string, number> = summary?.counts ?? {};
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
            className="text-success"
            loading={isLoading}
          />
          <StatCard
            label="Failed payments"
            value={counts.FAILED ?? 0}
            hint={`${counts.CANCELLED ?? 0} cancelled`}
            icon={CircleX}
            className="text-destructive"
            loading={isLoading}
          />
        </div>

        <TableCard
          fetching={isFetching}
          toolbar={
            <TableToolbar
              search={
                <TableSearch
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Search customer, event or transaction ID…"
                  aria-label="Search payments"
                />
              }
            >
              <h2 className="mr-auto text-base font-semibold">Transactions</h2>
              <FilterPill
                label="Filter by status"
                icon={ListFilter}
                options={STATUSES.map((s) => ({ ...s, count: s.value ? counts[s.value] : undefined }))}
                value={status}
                onChange={(v) => setParams({ status: v === "PAID" ? undefined : v ?? ALL_STATUSES })}
              />
            </TableToolbar>
          }
          footer={
            !isLoading &&
            !isError && (
              <Pagination page={page} pageSize={pageSize} total={data?.meta?.total ?? 0} noun="payments" />
            )
          }
        >
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Customer</TableHead>
                <TableHead>Event &amp; package</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Fee ({feePct})</TableHead>
                <TableHead className="text-right">Organizer</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeletonRows cols={7} />
              ) : isError ? (
                <TableMessage colSpan={7} error>
                  Failed to load payments.
                </TableMessage>
              ) : rows.length === 0 ? (
                <TableMessage colSpan={7}>No payments found.</TableMessage>
              ) : (
                rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="font-semibold">{p.rsvp.user.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{p.rsvp.user.email}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{p.rsvp.event.title}</p>
                      <p className="text-xs text-muted-foreground">{p.rsvp.package?.name ?? "—"}</p>
                    </TableCell>
                    <TableCell>
                      <StatusPill tone={STATUS_STYLE[p.status].tone} icon={STATUS_STYLE[p.status].icon}>
                        {p.status === "PAID" ? "Successful" : p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                      </StatusPill>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatBDT(p.amount)}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatBDT(p.platformFee)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatBDT(p.organizerAmount)}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {new Date(p.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableCard>
      </div>
    </SidebarInset>
  );
}

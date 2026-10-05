"use client";

import { StatCard } from "@/components/StatCard";
import {
  FilterPill,
  TableCard,
  TableMessage,
  TablePagination,
  TableSkeletonRows,
  TableToolbar,
} from "@/components/dashboard/DataTable";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusPill, type StatusTone } from "@/components/dashboard/StatusPill";
import { SidebarInset } from "@/components/ui/sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatBDT, PLATFORM_FEE_RATE } from "@/lib/fees";
import {
  type PaymentStatus,
  usePaymentsQuery,
} from "@/redux/features/Payment/payment.api";
import { useUserInfoQuery } from "@/redux/features/User/user.api";
import { Ban, CircleCheck, CircleX, Clock, Landmark, ListFilter, type LucideIcon, Undo2, Wallet } from "lucide-react";
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

const STATUSES: { label: string; value?: PaymentStatus }[] = [
  { label: "All statuses" },
  { label: "Successful", value: "PAID" },
  { label: "Failed", value: "FAILED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Pending", value: "UNPAID" },
];

const STATUS_STYLE: Record<PaymentStatus, { tone: StatusTone; icon: LucideIcon }> = {
  PAID: { tone: "green", icon: CircleCheck },
  FAILED: { tone: "red", icon: CircleX },
  CANCELLED: { tone: "muted", icon: Ban },
  UNPAID: { tone: "amber", icon: Clock },
  REFUNDED: { tone: "blue", icon: Undo2 },
};

export default function PaymentsPage() {
  const [status, setStatus] = useState<PaymentStatus | undefined>("PAID");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data: me } = useUserInfoQuery(undefined);
  const isAdmin = me?.data?.role === "ADMIN";
  const { data, isLoading, isFetching, isError } = usePaymentsQuery({
    status,
    page,
    limit: pageSize,
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

        <TableCard
          fetching={isFetching}
          toolbar={
            <TableToolbar>
              <h2 className="mr-auto text-base font-semibold">Transactions</h2>
              <FilterPill
                label="Filter by status"
                icon={ListFilter}
                options={STATUSES.map((s) => ({ ...s, count: s.value ? counts[s.value] : undefined }))}
                value={status}
                onChange={(v) => {
                  setStatus(v);
                  setPage(1);
                }}
              />
            </TableToolbar>
          }
          footer={
            !isLoading &&
            !isError && (
              <TablePagination
                page={page}
                pageSize={pageSize}
                total={data?.meta?.total ?? 0}
                noun="payments"
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
              />
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

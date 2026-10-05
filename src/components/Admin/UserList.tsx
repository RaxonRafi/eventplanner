"use client";

import { DeleteConfirmation } from "@/components/DeleteConfirmation";
import {
  TableCard,
  TableMessage,
  TableSearch,
  TableSkeletonRows,
  TableToolbar,
} from "@/components/dashboard/DataTable";
import { PageIntro } from "@/components/dashboard/PageHeader";
import { StatusPill, type StatusTone } from "@/components/dashboard/StatusPill";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePageParams, useSearchParam } from "@/hooks/use-query-params";
import { useAllUsersQuery, useDeleteUserMutation, useUserInfoQuery } from "@/redux/features/User/user.api";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "ORGANIZER" | "USER";
  createdAt: string;
};

const ROLE: Record<User["role"], { label: string; tone: StatusTone }> = {
  ADMIN: { label: "Admin", tone: "violet" },
  ORGANIZER: { label: "Organizer", tone: "blue" },
  USER: { label: "Member", tone: "muted" },
};

const initials = (u: User) =>
  (u.name || u.email)
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function UserList() {
  const { page, pageSize } = usePageParams();
  const { q, input, setInput } = useSearchParam();

  const { data, isLoading, isFetching, isError } = useAllUsersQuery({ page, take: pageSize, q: q || undefined });
  const { data: me } = useUserInfoQuery(undefined);
  const [deleteUser] = useDeleteUserMutation();

  const users: User[] = data?.data ?? [];

  const handleRemove = async (user: User) => {
    const id = toast.loading(`Removing ${user.name || user.email}…`);
    try {
      await deleteUser(user.id).unwrap();
      toast.success("User removed", { id });
    } catch (err) {
      const e = err as { data?: { error?: string } };
      toast.error(e?.data?.error || "Couldn't remove the user", { id });
    }
  };

  return (
    <div className="space-y-6">
      <PageIntro title="Users" description="Everyone registered on the platform." />
      <TableCard
        fetching={isFetching}
        toolbar={
          <TableToolbar
            search={
              <TableSearch
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search name or email…"
                aria-label="Search users"
              />
            }
          />
        }
        footer={
          !isLoading &&
          !isError && (
            <Pagination page={page} pageSize={pageSize} total={data?.total ?? 0} noun="users" />
          )
        }
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows rows={6} cols={4} />
            ) : isError ? (
              <TableMessage colSpan={4} error>
                Failed to load users.
              </TableMessage>
            ) : users.length === 0 ? (
              <TableMessage colSpan={4}>No users found.</TableMessage>
            ) : (
              users.map((u) => {
                const isMe = u.id === me?.data?.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {initials(u)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {u.name || "—"}{" "}
                            {isMe && <span className="text-xs font-normal text-muted-foreground">(you)</span>}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusPill tone={ROLE[u.role]?.tone ?? "muted"}>{ROLE[u.role]?.label ?? u.role}</StatusPill>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </TableCell>
                    <TableCell className="text-right">
                      {!isMe && (
                        <DeleteConfirmation
                          title={`Remove ${u.name || u.email}?`}
                          description="Their account and unpaid bookings will be deleted. Users who organize events or have paid bookings can't be removed."
                          confirmLabel="Remove user"
                          onConfirm={() => handleRemove(u)}
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8 rounded-full text-muted-foreground hover:text-destructive"
                            aria-label={`Remove ${u.name || u.email}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </DeleteConfirmation>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableCard>
    </div>
  );
}

"use client";

import { DeleteConfirmation } from "@/components/DeleteConfirmation";
import { PageIntro } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { useAllUsersQuery, useDeleteUserMutation, useUserInfoQuery } from "@/redux/features/User/user.api";
import { Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "ORGANIZER" | "USER";
  createdAt: string;
};

const ROLE: Record<User["role"], { label: string; className: string }> = {
  ADMIN: { label: "Admin", className: "bg-violet-500/15 text-violet-700 dark:text-violet-400" },
  ORGANIZER: { label: "Organizer", className: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  USER: { label: "Member", className: "bg-muted text-muted-foreground" },
};

const initials = (u: User) =>
  (u.name || u.email)
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function UserList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const q = useDebounce(search.trim(), 400);
  useEffect(() => setPage(1), [q]);

  const { data, isLoading, isFetching, isError } = useAllUsersQuery({ page, take: 10, q: q || undefined });
  const { data: me } = useUserInfoQuery(undefined);
  const [deleteUser] = useDeleteUserMutation();

  const users: User[] = data?.data ?? [];
  const totalPages: number = data?.totalPages ?? 1;

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
      <PageIntro
        title="Users"
        description="Everyone registered on the platform."
        actions={
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email…"
              className="pl-9"
              aria-label="Search users"
            />
          </div>
        }
      />
      <Card className="gap-0 overflow-hidden py-0">
        <div className={cn("overflow-x-auto", isFetching && "opacity-60")}>
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-muted-foreground">
                <th className="h-11 px-4 font-medium">User</th>
                <th className="h-11 px-4 font-medium">Role</th>
                <th className="h-11 px-4 font-medium">Joined</th>
                <th className="h-11 px-4 text-right font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-t">
                    <td colSpan={4} className="p-4">
                      <Skeleton className="h-9 w-full" />
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-destructive">
                    Failed to load users.
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isMe = u.id === me?.data?.id;
                  return (
                    <tr key={u.id} className="border-t transition-colors hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {initials(u)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {u.name || "—"} {isMe && <span className="text-xs text-muted-foreground">(you)</span>}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn("border-0", ROLE[u.role]?.className)}>
                          {ROLE[u.role]?.label ?? u.role}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                      </td>
                      <td className="px-4 py-3 text-right">
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
                              className="size-8 text-muted-foreground hover:text-destructive"
                              aria-label={`Remove ${u.name || u.email}`}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </DeleteConfirmation>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && !isError && (
          <p className="border-t px-4 py-3 text-xs text-muted-foreground">{data?.total ?? 0} users</p>
        )}
      </Card>
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <span className="mr-2 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

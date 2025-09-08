/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Trash2 } from "lucide-react";

import { useState } from "react";

import {
  useAllUsersQuery,
  useDeleteUserMutation,
} from "@/redux/features/User/user.api";
import { toast } from "sonner";
import { DeleteConfirmation } from "../DeleteConfirmation";

export function UserList() {
  const [currentPage, setCurrentPage] = useState(1);

  const [take] = useState(5);
  const { data, isLoading, isError } = useAllUsersQuery({
    page: currentPage,
    take,
  });
  const totalPage = data?.totalPages || 1;
  const users = data?.data || [];
  const [deleteUser] = useDeleteUserMutation();

  const handleRemoveUser = async (userId: string) => {
    const toastId = toast.loading("Removing...");
    try {
      const res = await deleteUser(userId).unwrap();
      if (res.message === "User deleted") {
        toast.success("Removed", { id: toastId });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading users</div>;
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User List</CardTitle>
        <CardAction>{/* <AddUsersForm/> */}</CardAction>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <caption className="mt-4 text-muted-foreground">
              A list of users
              {typeof data?.total === "number" ? ` • Total: ${data.total}` : ""}
              .
            </caption>
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Name
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Email
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Role
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Registered At
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-4 text-center text-muted-foreground"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr
                    key={user.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle font-medium">
                      {user.name}
                    </td>
                    <td className="p-4 align-middle">{user.email}</td>
                    <td className="p-4 align-middle">{user.role}</td>
                    <td className="p-4 align-middle">
                      {new Date(user.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 align-middle">
                      <DeleteConfirmation
                        onConfirm={() => handleRemoveUser(user.id)}
                      >
                        <Button size="sm">
                          <Trash2 />
                        </Button>
                      </DeleteConfirmation>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
      {totalPage && (
        <div className="flex justify-end mt-4">
          <div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    size="default"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPage }, (_, index) => index + 1).map(
                  (page) => (
                    <PaginationItem
                      key={page}
                      onClick={() => setCurrentPage(page)}
                    >
                      <PaginationLink
                        size="default"
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    size="default"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPage, prev + 1))
                    }
                    className={
                      currentPage === totalPage
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </Card>
  );
}

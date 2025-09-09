/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
import {
  useAllRsvpQuery,
  useMyRsvpsQuery,
} from "@/redux/features/Reservation/rsvp.api";
import { useUserInfoQuery } from "@/redux/features/User/user.api";

import { useState } from "react";

export function RsvpList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const {
    data: me,
    isLoading: meLoading,
    isError: meError,
  } = useUserInfoQuery(undefined);
  const role = me?.role as string | undefined;
  const isUser = role === "USER";
  const roleKnown = Boolean(role) || meError; // consider role unknown only while loading

  // When role is unknown (after meLoading=false), default to "my RSVPs"
  const allQ = useAllRsvpQuery(
    { page: currentPage, limit },
    { skip: meLoading || !role || isUser }
  );
  const myQ = useMyRsvpsQuery(
    { page: currentPage, limit },
    { skip: meLoading || (!!role && !isUser) ? true : false }
  );

  const active = isUser || !roleKnown ? myQ : allQ;
  const data = active.data;
  const isLoading = meLoading || active.isLoading;
  const isError = active.isError;

  const rsvps = data?.data || [];
  const totalPage = data?.meta?.totalPages || 1;

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading RSVPs</div>;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>RSVP List</CardTitle>
        <CardAction>{/* Add actions like export if needed */}</CardAction>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <caption className="mt-4 text-muted-foreground">
              A list of RSVPs
              {typeof data?.meta?.total === "number"
                ? ` • Total: ${data.meta.total}`
                : ""}
              .
            </caption>
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left font-medium">User</th>
                <th className="h-12 px-4 text-left font-medium">Email</th>
                <th className="h-12 px-4 text-left font-medium">Event</th>
                <th className="h-12 px-4 text-left font-medium">Package</th>
                <th className="h-12 px-4 text-left font-medium">Status</th>
                <th className="h-12 px-4 text-left font-medium">Paid</th>
                <th className="h-12 px-4 text-left font-medium">Payment Txn</th>
                <th className="h-12 px-4 text-left font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {rsvps.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="p-4 text-center text-muted-foreground"
                  >
                    No RSVPs found.
                  </td>
                </tr>
              ) : (
                rsvps.map((rsvp: any) => (
                  <tr
                    key={rsvp.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle font-medium">
                      {rsvp.user?.name}
                    </td>
                    <td className="p-4 align-middle">{rsvp.user?.email}</td>
                    <td className="p-4 align-middle">{rsvp.event?.title}</td>
                    <td className="p-4 align-middle">
                      {rsvp.package
                        ? `${rsvp.package.name} ($${rsvp.package.price})`
                        : "-"}
                    </td>
                    <td className="p-4 align-middle">{rsvp.status}</td>
                    <td className="p-4 align-middle">
                      {rsvp.paid ? "Yes" : "No"}
                    </td>
                    <td className="p-4 align-middle">
                      {rsvp.Payment?.[0]?.tranId || "-"}
                    </td>
                    <td className="p-4 align-middle">
                      {new Date(rsvp.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {totalPage > 1 && (
        <div className="flex justify-end mt-4">
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
                  <PaginationItem key={page}>
                    <PaginationLink
                      size="default"
                      isActive={currentPage === page}
                      onClick={() => setCurrentPage(page)}
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
      )}
    </Card>
  );
}

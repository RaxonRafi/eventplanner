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
  useAllEventsQuery,
} from "@/redux/features/Event/event.api";


export function EventList() {
  const [currentPage, setCurrentPage] = useState(1);

  const [take] = useState(5);
  const { data, isLoading, isError } = useAllEventsQuery({
    page: currentPage,
    take,
  });
  const totalPage = data?.totalPages || 1;
  const events = data || [];
console.log(data);
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading events</div>;
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Event List</CardTitle>
        <CardAction>{/* <AddEventForm/> */}</CardAction>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <caption className="mt-4 text-muted-foreground">
              A list of events
              {typeof data?.total === "number" ? ` • Total: ${data.total}` : ""}
              .
            </caption>
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Title
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Date
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Location
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Capacity
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Packages
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  RSVPs
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {events.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-4 text-center text-muted-foreground"
                  >
                    No events found.
                  </td>
                </tr>
              ) : (
                events.map((event: any) => (
                  <tr
                    key={event.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle font-medium">
                      {event.title}
                    </td>
                    <td className="p-4 align-middle">
                      {new Date(event.date).toLocaleString()}
                    </td>
                    <td className="p-4 align-middle">{event.location}</td>
                    <td className="p-4 align-middle">{event.capacity}</td>
                    <td className="p-4 align-middle">
                      {event.packages?.length
                        ? event.packages
                            .map((p: any) => `${p.name} ($${p.price})`)
                            .join(", ")
                        : "-"}
                    </td>
                    <td className="p-4 align-middle">
                      {event.rsvps?.length ?? 0}
                    </td>
                    <td className="p-4 align-middle">
                        <Button size="sm">
                          <Trash2 />
                        </Button>
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

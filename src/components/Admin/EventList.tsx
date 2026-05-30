/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useAllEventsQuery,
  useUpdateEventStatusMutation,
} from "@/redux/features/Event/event.api";
import { CheckCircle2, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    PENDING: "secondary",
    APPROVED: "default",
    REJECTED: "destructive",
  };
  return (
    <Badge variant={variants[status] ?? "outline"}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}

export function EventList() {
  const { data, isLoading, isError } = useAllEventsQuery({});
  const [updateStatus, { isLoading: isUpdating }] = useUpdateEventStatusMutation();

  const events = data ?? [];

  const handleStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Event ${status === "APPROVED" ? "approved" : "declined"}`);
    } catch {
      toast.error("Failed to update event status");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading events</div>;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>All Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <caption className="mt-4 text-muted-foreground">
              A list of all events • Total: {events.length}
            </caption>
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium">Title</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Organizer</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Location</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium">RSVPs</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-muted-foreground">
                    No events found.
                  </td>
                </tr>
              ) : (
                events.map((event: any) => (
                  <tr
                    key={event.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle font-medium">{event.title}</td>
                    <td className="p-4 align-middle text-sm text-muted-foreground">
                      {event.organizer?.name || event.organizer?.email || "-"}
                    </td>
                    <td className="p-4 align-middle">
                      {new Date(event.date).toLocaleString()}
                    </td>
                    <td className="p-4 align-middle">{event.location}</td>
                    <td className="p-4 align-middle">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="p-4 align-middle">{event.rsvps?.length ?? 0}</td>
                    <td className="p-4 align-middle">
                      <div className="flex gap-1">
                        {event.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatus(event.id, "APPROVED")}
                              disabled={isUpdating}
                            >
                              <CheckCircle2 className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleStatus(event.id, "REJECTED")}
                              disabled={isUpdating}
                            >
                              <XCircle className="size-4" />
                            </Button>
                          </>
                        )}
                        {event.status === "REJECTED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatus(event.id, "APPROVED")}
                            disabled={isUpdating}
                          >
                            Approve
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

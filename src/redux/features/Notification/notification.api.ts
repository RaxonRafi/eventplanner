import { baseApi } from "@/redux/baseApi";

export type AppNotification = {
  id: string;
  type: "BOOKING_CONFIRMED" | "NEW_BOOKING" | "PAYMENT_RECEIVED";
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    notifications: builder.query<{ data: AppNotification[]; unread: number }, { limit?: number } | void>({
      query: (args) => ({
        url: "/api/notifications",
        method: "GET",
        params: { limit: args?.limit ?? 20 },
      }),
      providesTags: ["NOTIFICATION"],
    }),
    markNotificationsRead: builder.mutation<{ updated: number }, { ids: string[] } | { all: true }>({
      query: (body) => ({
        url: "/api/notifications",
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["NOTIFICATION"],
    }),
  }),
});

export const { useNotificationsQuery, useMarkNotificationsReadMutation } = notificationApi;

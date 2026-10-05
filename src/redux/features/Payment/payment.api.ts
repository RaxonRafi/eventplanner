import { baseApi } from "@/redux/baseApi";

export type PaymentStatus = "PAID" | "FAILED" | "CANCELLED" | "UNPAID" | "REFUNDED";

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    payments: builder.query({
      query: ({
        status,
        page = 1,
        limit = 20,
        q,
      }: {
        status?: PaymentStatus;
        page?: number;
        limit?: number;
        q?: string;
      }) => ({
        url: "/api/payments",
        method: "GET",
        params: { status, page, limit, q },
      }),
      providesTags: ["RSVP"],
    }),
    dashboardStats: builder.query({
      query: () => ({
        url: "/api/dashboard/stats",
        method: "GET",
      }),
      providesTags: ["RSVP", "EVENT"],
    }),
  }),
});

export const { usePaymentsQuery, useDashboardStatsQuery } = paymentApi;

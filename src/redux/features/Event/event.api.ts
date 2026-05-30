import { baseApi } from "@/redux/baseApi";

export type EventStatus = "PENDING" | "APPROVED" | "REJECTED";

export const eventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    allEvents: builder.query({
      query: ({ status }: { status?: EventStatus } = {}) => ({
        url: "/api/events",
        method: "GET",
        params: status ? { status } : undefined,
      }),
      providesTags: ["EVENT"],
    }),
    OrgEvents: builder.query({
      query: ({ page, take, q, sort }) => ({
        url: "/api/events/org",
        method: "GET",
        params: { page, limit: take, q, sort },
      }),
      providesTags: ["EVENT"],
    }),
    publicEvents: builder.query({
      query: ({
        page = 1,
        limit = 3,
        q,
      }: {
        page?: number;
        limit?: number;
        q?: string;
      }) => ({
        url: "/api/events/public",
        method: "GET",
        params: { page, limit, q },
      }),
      providesTags: ["EVENT"],
    }),
    createEvent: builder.mutation({
      query: (eventInfo) => ({
        url: "/api/events",
        method: "POST",
        data: eventInfo,
      }),
      invalidatesTags: ["EVENT"],
    }),
    updateEventStatus: builder.mutation({
      query: ({ id, status }: { id: string; status: EventStatus }) => ({
        url: `/api/events/${id}/status`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: ["EVENT"],
    }),
    uploadBanner: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({
        url: "/api/upload",
        method: "POST",
        data: formData,
      }),
    }),
    eventById: builder.query({
      query: (id: string) => ({
        url: `/api/events/${id}`,
        method: "GET",
      }),
      providesTags: ["EVENT"],
    }),
    adminStats: builder.query({
      query: () => ({
        url: "/api/admin/stats",
        method: "GET",
      }),
      providesTags: ["EVENT", "USER"],
    }),
  }),
});
export const {
  useAllEventsQuery,
  useOrgEventsQuery,
  useCreateEventMutation,
  usePublicEventsQuery,
  useEventByIdQuery,
  useUpdateEventStatusMutation,
  useUploadBannerMutation,
  useAdminStatsQuery,
} = eventApi;

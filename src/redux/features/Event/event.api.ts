import { baseApi } from "@/redux/baseApi";

export const eventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    allEvents: builder.query({
      query: ({ page, take }) => ({
        url: "/api/events",
        method: "GET",
        params: { page, take },
      }),
      providesTags: ["EVENT"],
    }),
    OrgEvents: builder.query({
      query: ({ page, take }) => ({
        url: "/api/events/org",
        method: "GET",
        params: { page, take },
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
    }),
    eventById: builder.query({
      query: (id: string) => ({
        url: `/api/events/${id}`,
        method: "GET",
      }),
      providesTags: ["EVENT"],
    }),
    // deleteUser: builder.mutation({
    //   query: (userId) => ({
    //     url: `/api/users/${userId}`,
    //     method: "DELETE",
    //   }),
    //   invalidatesTags: ["USER"],
    // }),
  }),
});
export const {
  useAllEventsQuery,
  useOrgEventsQuery,
  useCreateEventMutation,
  usePublicEventsQuery,
  useEventByIdQuery,
} = eventApi;

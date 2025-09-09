import { baseApi } from "@/redux/baseApi";

export const rsvpApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createRsvp: builder.mutation({
      query: (rsvpInfo) => ({
        url: "/api/rsvp",
        method: "POST",
        data: rsvpInfo,
      }),
    }),
    allRsvp: builder.query({
      query: ({ page, limit }) => ({
        url: "/api/rsvp",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["RSVP"],
    }),
    myRsvps: builder.query({
      query: ({
        eventId,
        status,
        page = 1,
        limit = 1,
      }: {
        eventId?: string;
        status?: string;
        page?: number;
        limit?: number;
      }) => ({
        url: "/api/rsvp/my",
        method: "GET",
        params: { eventId, status, page, limit },
      }),
      providesTags: ["RSVP"],
    }),
  }),
});
export const { useAllRsvpQuery, useCreateRsvpMutation, useMyRsvpsQuery } =
  rsvpApi;

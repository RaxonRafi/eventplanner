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
    // deleteUser: builder.mutation({
    //   query: (userId) => ({
    //     url: `/api/users/${userId}`,
    //     method: "DELETE",
    //   }),
    //   invalidatesTags: ["USER"],
    // }),
  }),
});
export const { useAllEventsQuery } =
  eventApi;

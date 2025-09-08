import { baseApi } from "@/redux/baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    userInfo: builder.query({
      query: () => ({
        url: "/api/users/me",
        method: "GET",
      }),
      providesTags: ["USER"],
    }),
    register: builder.mutation({
      query: (userInfo) => ({
        url: "/api/users",
        method: "POST",
        data: userInfo,
      }),
    }),
    allUsers: builder.query({
      query: ({ page, take }) => ({
        url: "/api/users",
        method: "GET",
        params: { page, take },
      }),
      providesTags: ["USER"],
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/api/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["USER"],
    }),
  }),
});
export const { useUserInfoQuery, useRegisterMutation, useAllUsersQuery , useDeleteUserMutation } =
  userApi;

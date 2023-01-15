import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "utils/VideoUtils";

const fastmeetApi = createApi({
  reducerPath: "fastmeetApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: [],
  endpoints: (builder: any) => ({
    getTurnServer: builder.query({
      query: () => `/api/turn-server`,
    }),
    getAvatar: builder.query({
      query: ({ ...params }) => ({ url: `/api/get-avatar`, params }),
    }),
  }),
});

export default fastmeetApi;

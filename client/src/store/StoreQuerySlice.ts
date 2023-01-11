import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const fastmeetApi = createApi({
  reducerPath: "fastmeetApi",
  baseQuery: fetchBaseQuery({ baseUrl: "" }),
  tagTypes: [],
  endpoints: (builder: any) => ({}),
});

export default fastmeetApi;

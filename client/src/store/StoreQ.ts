import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import globalSlice from "./StoreSlice";
import fastmeetApi from "./StoreQuerySlice";

const storeQ = configureStore({
  reducer: {
    [globalSlice.name]: globalSlice.reducer,
    [fastmeetApi.reducerPath]: fastmeetApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      fastmeetApi.middleware
      // @ts-ignore
      //   rtkqOnResetMiddleware(fastmeetApi)
    ),
});

setupListeners(storeQ.dispatch);

export default storeQ;

import React, { lazy } from "react";
import { Navigate, useRoutes } from "react-router-dom";

import { configureRoutes } from "utils/RouteUtils";
import { RouteEnum } from "constants/RouteConstants";
import AppThemeProvider from "AppThemeProvider";
import Suspense from "common/Suspense";
import { SnackbarProvider } from "notistack";

function App() {
  const routes = useRoutes(ROUTES);

  return (
    <AppThemeProvider>
      <SnackbarProvider
        anchorOrigin={{ horizontal: "center", vertical: "top" }}
        preventDuplicate
      >
        <Suspense>{routes}</Suspense>
      </SnackbarProvider>
    </AppThemeProvider>
  );
}

const ROUTES = configureRoutes([
  {
    path: "*",
    element: <Navigate to={RouteEnum.HOME} replace />,
  },
  {
    path: RouteEnum.MEET_JOIN,
    element: lazy(() => import("features/videoMeet/VideoMeetJoin")),
  },
  {
    path: RouteEnum.MEET,
    element: lazy(() => import("features/videoMeet/VideoMeetJoin")),
  },
  {
    path: RouteEnum.HOME,
    element: lazy(() => import("features/home/Home")),
  },
]);

export default App;

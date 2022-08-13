import React, { FunctionComponent } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";

import theme from "configs/ThemeConfig";

const AppThemeProvider: FunctionComponent<{ children: JSX.Element }> = (
  props
) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {props.children}
    </ThemeProvider>
  );
};

export default AppThemeProvider;

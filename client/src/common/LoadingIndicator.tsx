import React, { forwardRef } from "react";
import { CircularProgress } from "@mui/material";

const LoadingIndicator = forwardRef(
  /**
   *
   * @param {import("@mui/material").CircularProgressProps} props
   */
  function LoadingIndicator(props: { [rest: string]: any }, ref) {
    return <CircularProgress ref={ref} {...props} />;
  }
);

export default LoadingIndicator;

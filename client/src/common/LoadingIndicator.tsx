import React from "react";

/**
 *
 * @param {import("@mui/material").CircularProgressProps} props
 */
function LoadingIndicator(props: { [rest: string]: any }) {
  return <div className="loader-indicator" {...props}></div>;
}

export default LoadingIndicator;

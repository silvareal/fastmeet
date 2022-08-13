import React from "react";
import { Suspense as ReactSuspense } from "react";
import LoadingIndicator from "./LoadingIndicator";

/**
 *
 * @param {import('react').SuspenseProps} props
 */
function Suspense({ ...props }) {
  return <ReactSuspense {...props} />;
}

Suspense.defaultProps = {
  fallback: (
    <div className="flex justify-center items-center h-screen w-screen">
      <div className="flex justify-center">
        <LoadingIndicator />
      </div>
    </div>
  ),
};

export default Suspense;

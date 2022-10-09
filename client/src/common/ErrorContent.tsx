import React from "react";
import { Typography, Icon } from "@mui/material";
import clsx from "clsx";

interface ErrorContentType {
  title: string;
  description: string;
  className?: string;
  onTryAgain?: () => void;
}

/**
 *
 * @param {ErrorContentProps} props
 */

function ErrorContent(props: ErrorContentType): JSX.Element {
  const { title, description, className, onTryAgain, ...rest } = props;

  return (
    <div
      className={clsx(
        "p-8 flex flex-col justify-center items-center",
        className
      )}
      {...rest}
    >
      <Typography variant="h6" className="font-bold text-center">
        {title}
      </Typography>
      <div>
        <Icon className="text-error-main" style={{ fontSize: "100px" }}>
          sentiment_dissatisfied
        </Icon>
      </div>
      <Typography variant="body2" className="text-center mb-4 font-bold">
        {description}
      </Typography>
    </div>
  );
}

ErrorContent.defaultProps = {
  title: "Something went wrong",
  description: "We're quite sorry about this!",
};

export default ErrorContent;

/**
 * @typedef {{
 * onTryAgain: Function
 * } & import("@mui/material").PaperProps} ErrorContentProps
 */

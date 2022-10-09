import { Icon, Typography } from "@mui/material";
import React from "react";
import { Icon as Iconify } from "@iconify/react";

export default function VideoMeetJoinVideoPreviewerBody({
  streamError,
}: {
  streamError: string;
}): JSX.Element {
  return (
    <>
      {!!streamError && (
        <div className="flex items-center flex-col">
          <Icon color="error" sx={{ fontSize: "100px" }}>
            <Iconify icon="fluent:error-circle-16-regular" />
          </Icon>
          <Typography variant="h5" color="error">
            {streamError}
          </Typography>
        </div>
      )}
    </>
  );
}

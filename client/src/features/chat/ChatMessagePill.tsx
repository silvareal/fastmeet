import { Box, Typography } from "@mui/material";
import { FC } from "react";
import { MessageDetailsType } from "./ChatType";

export const ChatMessagePill: FC<{ message: MessageDetailsType }> = ({
  message,
}) => {
  const messageTime = new Date();
  return (
    <Box className="bg-common-black text-common-white mb-1 p-2 max-w-[80%] w-max rounded-lg box-border">
      <Typography variant="body1" className=" break-all">
        {message?.message}
      </Typography>
      <Typography variant="caption" className="mr-1">
        {message.senderDetails?.userName || "Sam"}
      </Typography>
      <Typography variant="caption" sx={{ opacity: "0.7" }}>
        {messageTime.getHours()} : {messageTime.getMinutes()}
      </Typography>
    </Box>
  );
};

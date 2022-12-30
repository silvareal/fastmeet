import { Icon } from "@iconify/react";
import { Box, IconButton, Typography } from "@mui/material";
import ThemeConfig from "configs/ThemeConfig";
import { FC, useRef, useState } from "react";
import { Chat } from "./Chat";
import { MessageDetailsType } from "./ChatType";

export const ChatDrawer: FC<{
  open: boolean;
  onClose: () => void;
  title: string;
}> = ({ open, onClose, title }) => {
  return (
    <Box
      className={`rounded-lg ${
        open ? "w-[500px]" : "w-0"
      }  h-full min-h-full box-border bg-common-white flex flex-col justify-between pb-4`}
      style={{
        transition: ThemeConfig.transitions.create("width", {
          easing: ThemeConfig.transitions.easing.easeInOut,
          duration: ThemeConfig.transitions.duration.enteringScreen,
        }),
      }}
    >
      {/* chat header */}
      {!!open && (
        <Box className="flex px-2 py-4 pr-0 justify-between items-center">
          <Typography variant="h5">{title}</Typography>
          <IconButton onClick={() => onClose()}>
            <Icon icon="iconoir:cancel" fontSize={30} />
          </IconButton>
        </Box>
      )}

      {/* chat messages and input */}
      {!!open && <Chat />}
    </Box>
  );
};

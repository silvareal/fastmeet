import { Icon } from "@iconify/react";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import ThemeConfig from "configs/ThemeConfig";
import { FC, useRef, useState } from "react";
import { VideoMeetChatMessagePill } from "./VideoMeetChatMessagePill";
import { MessageDetails } from "./VideoMeetType";

export const VideoMeetChatDrawer: FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const [messageOnQue, setMessageOnQue] = useState<string>("");
  const [messages, setMessages] = useState<MessageDetails[]>([]);
  const messageInputRef = useRef<HTMLInputElement>(null);

  return (
    <Box
      className={`rounded-lg ${open ? "min-w-1/5" : "min-w-0"} ${
        open ? "w-1/5" : "w-0"
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
          <Typography variant="h5">In-Call Messages</Typography>
          <IconButton onClick={() => onClose()}>
            <Icon icon="iconoir:cancel" fontSize={30} />
          </IconButton>
        </Box>
      )}

      {/* chat messages and input */}
      {!!open && (
        <Box className="justify-between mx-4 my-0 flex flex-col box-border">
          {messages.map((message) => (
            <VideoMeetChatMessagePill message={message} />
          ))}

          <TextField
            // multiline
            // rows={1}
            // maxRows={3}
            fullWidth
            placeholder="type here"
            autoFocus
            value={messageOnQue}
            ref={messageInputRef}
            className="self-end flex rounded-18xl"
            onChange={(e) => setMessageOnQue(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={(e) => {
                    if (messageOnQue === "") {
                      return;
                    }
                    setMessages([
                      ...messages,
                      {
                        message: messageOnQue,
                        senderDetails: {
                          userName: "samankwe",
                          ID: Math.random().toString(),
                        },
                      },
                    ]);
                    setMessageOnQue("");
                  }}
                >
                  <Icon icon="carbon:send" fontSize={30} />
                </IconButton>
              ),
            }}
          />
        </Box>
      )}
    </Box>
  );
};


import { Fab, IconButton, Typography, useMediaQuery } from "@mui/material";
import { useFormik } from "formik";
import { FC } from "react";
import { useParams } from "react-router-dom";
import * as yup from "yup";
import Drawer from "@mui/material/Drawer";
import { Box } from "@mui/system";

import { Icon } from "@iconify/react";
import ThemeConfig from "configs/ThemeConfig";
import { APP_SIDE_MENU_WIDTH } from "constants/Global";
import { PeersRefType, PeersType } from "features/videoMeet/VideoMeetType";
import { Chat } from "./Chat";
import { socket } from "utils/VideoUtils";
import { MessageDetailsType } from "./ChatType";
import useChatDrawer from "hooks/useChatDrawer";

export const ChatDrawer: FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  setPeers: Function;
  peersRef: { current: PeersRefType[] };
  messages: MessageDetailsType[];
  updateMessages: (message: MessageDetailsType) => void;
}> = ({
  open,
  onClose,
  title,
  setPeers,
  peersRef,
  messages,
  updateMessages,
}) => {
  const { meetId } = useParams();
  const isMd = useMediaQuery(ThemeConfig.breakpoints.down("md"));
  const { isChatDrawer, toggleChatDrawer } = useChatDrawer();

  socket.on(
    "messageAction",
    async (payload: {
      room_id: string;
      socket_id: string;
      message: string;
    }) => {
      try {
        console.log("payload data", payload);
      } catch (err) {
        if (err) console.log(err);
      }
      setPeers((peers: PeersType[]) => {
        const peerIndex = peers.findIndex(
          (peer: PeersType) => peer.peerId === payload.socket_id
        );
        const newPeer: PeersType[] = [...peers];

        const peerItem: PeersType = newPeer[peerIndex];

        if (peerItem && payload.message) {
          updateMessages({
            message: payload.message,
            senderDetails: {
              userName: peerItem?.userObj?.peer_name,
              ID: peerItem?.userObj?.socketId,
            },
          });
        }
        peersRef.current = newPeer;
        return newPeer;
      });
    }
  );

  const formik = useFormik({
    initialValues: {
      message: "",
    },
    enableReinitialize: true,
    validationSchema: yup.object({
      message: yup.string().required().trim(),
    }),
    onSubmit: (values, { resetForm }) => {
      socket.emit("messageAction", {
        room_id: meetId,
        socket_id: socket.id,
        message: values.message,
      } as any);

      updateMessages({
        message: values.message,
        senderDetails: {
          isFromMe: true,
        },
      });
      resetForm();
    },
  });

  return (
    <Drawer
      sx={{
        border: "none",

        "& .MuiDrawer-paper": {
          width: "100%",
          border: "none",
          maxWidth: APP_SIDE_MENU_WIDTH,
          backgroundColor: ThemeConfig.palette.primary.main,
        },
      }}
      variant={"persistent"}
      anchor="right"
      open={isChatDrawer}
    >
      {!!isChatDrawer && (
        <Box className="inline-flex px-3 py-4 pr-0 justify-between items-center text-common-white">
          <Typography variant="h6">{title}</Typography>
          <Fab
            variant="opaque"
            color="primary"
            size="small"
            onClick={() => toggleChatDrawer?.()}
          >
            <Icon icon="iconoir:cancel" fontSize={16} />
          </Fab>
        </Box>
      )}

      {!!isChatDrawer && <Chat formik={formik} messages={messages} />}
    </Drawer>
  );
};

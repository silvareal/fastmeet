import { Icon } from "@iconify/react";
import { Box, IconButton, Typography } from "@mui/material";
import ThemeConfig from "configs/ThemeConfig";
import { PeersRefType, PeersType } from "features/videoMeet/VideoMeetType";
import { useFormik } from "formik";
import { FC } from "react";
import { socket } from "utils/VideoUtils";
import { Chat } from "./Chat";
import { MessageDetailsType } from "./ChatType";
import * as yup from "yup";
import { useParams } from "react-router-dom";

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
    <Box
      className={`rounded-lg ${
        !!open ? "max-w-[450px] min-w-[300px] w-full" : "w-0"
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

      {!!open && <Chat formik={formik} messages={messages} />}
    </Box>
  );
};

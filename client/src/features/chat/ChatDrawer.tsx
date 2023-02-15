import { IconButton, Typography } from "@mui/material";
import { PeersRefType, PeersType } from "features/videoMeet/VideoMeetType";
import { useFormik } from "formik";
import { FC } from "react";
import { useParams } from "react-router-dom";
import { socket } from "utils/VideoUtils";
import * as yup from "yup";
import { MessageDetailsType } from "./ChatType";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Box } from "@mui/system";
import { Chat } from "./Chat";
import { Icon } from "@iconify/react";
import ThemeConfig from "configs/ThemeConfig";

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

  const drawerWidth = open ? "450px" : 0;

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        backgroundColor: "#000",
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          maxHeight: "100%",
          backgroundColor: "#000",
        },
        transition: ThemeConfig.transitions.create("width", {
          easing: ThemeConfig.transitions.easing.easeInOut,
          duration: ThemeConfig.transitions.duration.enteringScreen,
        }),
      }}
      className={`rounded-lg  h-full min-h-full box-border bg-common-white  flex flex-col justify-between pb-4`}
      variant="persistent"
      anchor="right"
      open={open}
    >
      {!!open && (
        <Box className="flex px-2 py-4 pr-0 justify-between items-center text-common-white">
          <Typography variant="h5">{title}</Typography>
          <IconButton onClick={() => onClose()}>
            <Icon icon="iconoir:cancel" fontSize={30} />
          </IconButton>
        </Box>
      )}

      {!!open && <Chat formik={formik} messages={messages} />}
    </Drawer>
  );
};

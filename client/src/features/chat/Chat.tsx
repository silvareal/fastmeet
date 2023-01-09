import { Icon } from "@iconify/react";
import { Box, IconButton, TextField } from "@mui/material";
import React, { Dispatch, useState } from "react";
import { ChatMessagePill } from "./ChatMessagePill";
import { MessageDetailsType } from "./ChatType";
import { useFormik } from "formik";
import * as yup from "yup";
import { socket } from "utils/VideoUtils";
import { useParams } from "react-router-dom";
import { PeersRefType, PeersType } from "features/videoMeet/VideoMeetType";

export const Chat = (props: {
  setPeers: Function;
  peersRef: { current: PeersRefType[] };
}) => {
  const { setPeers, peersRef } = props;

  const [messages, setMessages] = useState<MessageDetailsType[]>([]);
  const { meetId } = useParams();

  /**
   * Message actions
   */
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
          setMessages([
            ...messages,
            {
              message: payload.message,
              senderDetails: {
                userName: peerItem?.userObj?.peer_name,
                ID: peerItem?.userObj?.socketId,
              },
              isMessageRead: false,
            },
          ]);
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

      setMessages([
        ...messages,
        {
          message: values.message,
          senderDetails: {
            isFromMe: true,
          },
          isMessageRead: false,
        },
      ]);
      resetForm();
    },
  });

  return (
    <Box className="max-h-full mx-4 my-0 flex flex-col box-border">
      <Box className="max-h-full overflow-scroll box-border flex flex-col">
        {messages.map((message, index) => (
          <ChatMessagePill key={index} message={message} />
        ))}
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <TextField
          {...formik.getFieldProps("message")}
          fullWidth
          placeholder="type here"
          autoFocus
          className="self-end flex rounded-18xl"
          InputProps={{
            endAdornment: (
              <IconButton
                type="submit"
                disabled={
                  formik.touched.message && Boolean(formik.errors.message)
                }
              >
                <Icon icon="carbon:send" fontSize={30} />
              </IconButton>
            ),
          }}
        />
      </form>
    </Box>
  );
};

import {
  Button,
  Container,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import React, { useRef, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { io } from "socket.io-client";
import Peer from "simple-peer";

import AppHeader from "AppHeader";
import VideoPreviewer from "common/VideoPreviewer";
import {
  getPeerInfo,
  hangUp,
  toggleAudio,
  toggleCamera,
} from "./VideoMeetCommon";
import VideoMeetJoinVideoPreviewerBody from "./VideoMeetJoinVideoPreviewerBody";
import VideoMeetJoinVideoPreviewerHeader from "./VideoMeetJoinVideoPreviewerHeader";
import VideoMeetJoinVideoPreviewerFooter from "./VideoMeetJoinVideoPreviewerFooter";
import VideoMeet from "./VideoMeet";
import useAxios from "axios-hooks";
import {
  PeersType,
  UserObjType,
  UserJoinedPayloadType,
  PeersRefType,
} from "./VideoMeetType";
import LoadingContent from "common/LoadingContent";

const baseUrl: string = process.env.REACT_APP_BASE_URL || "";
const socket = io(`${baseUrl}/video`);

export default function VideoMeetJoin() {
  const { meetId } = useParams();
  const navigate = useNavigate();

  const peersRef: { current: any } = useRef([]);

  const [camera, setCamera] = useState(false);
  const [mic, setMic] = useState(false);
  const [localMediaStream, setLocalMediaStream] = useState<MediaStream>();
  const [streamError, setStreamError] = useState<string>("");
  const [iceServers, setIceServers] = useState();
  const [canJoinMeeting, setCanJoinMeeting] = useState<boolean>(false);
  const [peers, setPeers] = useState<PeersType[]>([]);

  const { enqueueSnackbar } = useSnackbar();

  const [getTurnServerQuery] = useAxios({
    url: `${process.env.REACT_APP_BASE_URL}/turn-server`,
    method: "GET",
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      gender: "male",
      meetId,
    },
    enableReinitialize: true,
    validationSchema: yup.object({
      name: yup.string().label("Full Name").required("Required"),
      gender: yup.string().label("Full Name").required("Required"),
    }),
    onSubmit: (values) => {
      setCanJoinMeeting(true);
    },
  });

  const [getAvatarQuery] = useAxios({
    url: `${process.env.REACT_APP_BASE_URL}/get-avatar`,
    method: "GET",
    params: {
      category: formik.values.gender,
    },
  });

  function createPeer(
    userToSignal: any,
    callerId: string,
    stream: MediaStream
  ) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: {
        iceServers,
      },
    });

    peer.on("signal", (signal) => {
      socket.emit("initiate-signal", {
        userToSignal,
        callerId,
        signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal: any, callerId: string, stream: MediaStream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
      config: {
        iceServers,
      },
    });

    peer.on("signal", (signal) => {
      socket.emit("acknowledge-signal", { signal, callerId });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  /**
   * join to channel and send some peer info
   * @param stream MediaStream
   */
  function joinToChannel(stream: MediaStream) {
    socket.emit("join", meetId, {
      userAgent: navigator.userAgent.toLowerCase(),
      channel_password: "",
      avatar: getAvatarQuery.data.data,
      peer_info: getPeerInfo(),
      peer_name: formik.values.name,
      peer_gender: formik.values.gender,
      peer_video: camera,
      peer_audio: mic,
    });

    socket.on("clients-in-room", (users: UserObjType[]) => {
      const peers: PeersType[] = [];
      // To all users who are already in the room initiating a peer connection
      users.forEach((user: UserObjType) => {
        const peer = createPeer(user.socketId, socket.id, stream);

        peersRef.current.push({
          peerId: user.socketId,
          peerObj: peer,
          userObj: user,
        });
        peers.push({
          peerId: user.socketId,
          peerObj: peer,
          userObj: user,
        });
      });

      setPeers(peers);
    });

    /**
     * once the users initiate signal we will call add peer
     * to acknowledge the signal and send the stream
     */
    socket.on("user-joined", (payload: UserJoinedPayloadType) => {
      const peer = addPeer(payload.signal, payload.callerId, stream);
      peersRef.current.push({
        peerId: payload.callerId,
        peerObj: peer,
        userObj: payload.user,
      });
      setPeers((users: PeersType[]) => [
        ...users,
        { peerId: payload.callerId, peerObj: peer, userObj: payload.user },
      ]);

      enqueueSnackbar(`${payload.user?.peer_name} joined meeting`, {
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });
    });

    // once the signal is accepted calling the signal with signal
    // from other user so that stream can flow between peers
    socket.on("signal-accepted", (payload: { signal: any; id: string }) => {
      const item: PeersRefType = peersRef.current.find(
        (peer: PeersType) => peer.peerId === payload.id
      );
      item.peerObj.signal(payload.signal);
    });

    /**
     * if some user is disconnected removing his references.
     */
    socket.on("userDisconnected", (payload: { socketId: string }) => {
      const item: PeersType = peersRef.current.find(
        (peer: PeersType) => peer.peerId === payload.socketId
      );
      // destroy peer
      if (item) {
        item.peerObj.destroy();
      }

      // removing the peer from the arrays and storing remaining peers in new array
      const peers = peersRef.current.filter(
        (peer: PeersType) => peer.peerId !== payload.socketId
      );

      enqueueSnackbar(`${item.userObj.peer_name} Left meeting`, {
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
      });

      peersRef.current = peers;
      setPeers(peers);
    });

    /**
     * Relay peer actions
     */
    socket.on(
      "peerAction",
      (payload: {
        room_id: string;
        socket_id: string;
        peer_name: string;
        peer_audio: boolean;
        peer_video: boolean;
      }) => {
        var peerIndex = peersRef.current.findIndex(
          (peer: PeersType) => peer.peerId === payload.socket_id
        );
        const newPeer: PeersType[] = [...peersRef.current];

        var peerItem: PeersType = newPeer[peerIndex];
        peerItem.userObj.peer_audio = payload.peer_audio;
        peerItem.userObj.peer_video = payload.peer_video;
        peerItem.userObj.peer_name = payload.peer_name;

        peersRef.current = newPeer;
        setPeers(newPeer);
      }
    );
  }

  function initEnumerateDevices() {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: { echoCancellation: true } })
      .then((stream: MediaStream) => {
        setLocalMediaStream(stream);
        setCamera(true);
        setMic(true);
      })
      .catch((err) => {
        console.log("err", err);
        setCamera(false);
        setMic(false);
        setStreamError(err?.name);

        /* handle the error */
        if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          // Required track is missing
        } else if (
          err.name === "NotReadableError" ||
          err.name === "TrackStartError"
        ) {
          //webcam or mic are already in use
        } else if (
          err.name === "OverconstrainedError" ||
          err.name === "ConstraintNotSatisfiedError"
        ) {
          //constraints can not be satisfied by avb. devices
        } else if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          //permission denied in browser
        } else if (err.name === "TypeError" || err.name === "TypeError") {
          //empty constraints object
        } else {
          //other errors
        }
      });
  }

  useEffect(() => {
    if (canJoinMeeting && localMediaStream !== undefined) {
      joinToChannel(localMediaStream);
    }
    // eslint-disable-next-line
  }, [canJoinMeeting, localMediaStream]);

  useEffect(() => {
    if (!!getTurnServerQuery.response && !getTurnServerQuery.error) {
      setIceServers(getTurnServerQuery.data.data.iceServers);
    }
  }, [getTurnServerQuery]);

  useEffect(() => {
    if (!!iceServers) {
      initEnumerateDevices();
    }
  }, [iceServers]);

  return (
    <>
      {canJoinMeeting ? (
        <LoadingContent
          loading={getTurnServerQuery.loading}
          error={!!getTurnServerQuery.error}
        >
          <VideoMeet
            camera={camera}
            toggleCamera={() => {
              toggleCamera(localMediaStream, setCamera, function (camera) {
                socket.emit("peerAction", {
                  room_id: meetId,
                  socket_id: socket.id,
                  peer_name: formik.values.name,
                  peer_audio: mic,
                  peer_video: camera,
                });
              });
            }}
            mic={mic}
            toggleAudio={() => {
              toggleAudio(localMediaStream, setMic, function (mic) {
                socket.emit("peerAction", {
                  room_id: meetId,
                  socket_id: socket.id,
                  peer_name: formik.values.name,
                  peer_audio: mic,
                  peer_video: camera,
                });
              });
            }}
            hangUp={() => {
              hangUp(localMediaStream);
              navigate("/");
            }}
            onInputName={(e: React.ChangeEvent<HTMLInputElement>) => {
              console.log("event", e.target.innerHTML);
              formik.setFieldValue("name", e.target.innerHTML);
              socket.emit("peerAction", {
                room_id: meetId,
                socket_id: socket.id,
                peer_name: e.target.innerHTML,
                peer_audio: mic,
                peer_video: camera,
              });
            }}
            localMediaStream={localMediaStream}
            formik={formik}
            peers={peers}
            getAvatarQuery={getAvatarQuery}
          />
        </LoadingContent>
      ) : (
        <div className="bg-gray-100 min-h-screen">
          <AppHeader />
          <LoadingContent
            loading={getTurnServerQuery.loading}
            error={!!getTurnServerQuery.error}
          >
            <Container maxWidth="xl" className="flex min-h-screen items-center">
              <div className="grid grid-cols-3 gap-10 w-full">
                <form
                  onSubmit={formik.handleSubmit}
                  className="flex flex-col  items-center w-full justify-around h-full"
                >
                  <div className="w-full">
                    <TextField
                      label="Name"
                      placeholder="Sylvernus Akubo"
                      fullWidth
                      {...formik.getFieldProps("name")}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                    />
                    <RadioGroup
                      aria-label="gender"
                      row
                      {...formik.getFieldProps("gender")}
                      className="flex justify-center"
                    >
                      <FormControlLabel
                        value="female"
                        control={<Radio />}
                        label="Female"
                      />
                      <FormControlLabel
                        value="male"
                        control={<Radio />}
                        label="Male"
                      />
                    </RadioGroup>
                  </div>

                  <Button
                    size="large"
                    fullWidth
                    type="submit"
                    className="mt-10"
                  >
                    Join Meeting
                  </Button>
                </form>

                <div className="col-span-2 h-[450px]">
                  <VideoPreviewer
                    camera={camera}
                    mic={mic}
                    muted={true}
                    active={true}
                    srcObject={localMediaStream}
                    header={
                      <VideoMeetJoinVideoPreviewerHeader
                        localMediaStream={localMediaStream}
                      />
                    }
                    body={
                      <VideoMeetJoinVideoPreviewerBody
                        streamError={streamError}
                      />
                    }
                    footer={
                      <VideoMeetJoinVideoPreviewerFooter
                        camera={camera}
                        toggleCamera={() =>
                          toggleAudio(localMediaStream, setMic)
                        }
                        mic={mic}
                        toggleAudio={() =>
                          toggleCamera(localMediaStream, setCamera)
                        }
                      />
                    }
                  />
                </div>
              </div>
            </Container>
          </LoadingContent>
        </div>
      )}
    </>
  );
}

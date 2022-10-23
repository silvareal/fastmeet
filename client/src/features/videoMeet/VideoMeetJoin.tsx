import { Container, Icon } from "@mui/material";
import React, { useRef, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { io } from "socket.io-client";
import { Icon as Iconify } from "@iconify/react";

import AppHeader from "AppHeader";
import VideoPreviewer from "common/VideoPreviewer";
import {
  getPeerInfo,
  hangUp,
  toggleAudio,
  toggleCamera,
  addPeer,
  createPeer,
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
  PeerActionStatusConfig,
} from "./VideoMeetType";
import LoadingContent from "common/LoadingContent";
import VideoMeetJoinForm from "./VideoMeetJoinForm";
import { genderToPronoun } from "utils/GLobalUtils";
import usePlaySound from "hooks/usePlaySound";
import ThemeConfig from "configs/ThemeConfig";

const baseUrl: string = process.env.REACT_APP_BASE_URL || "";
const socket = io(`${baseUrl}/video`, { forceNew: false });

export default function VideoMeetJoin() {
  const { meetId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const peersRef: { current: any } = useRef([]);
  const screenRecordRef: { current: any } = useRef<boolean>(false);

  const [camera, setCamera] = useState<boolean>(false);
  const [mic, setMic] = useState<boolean>(false);

  // eslint-disable-next-line
  const [screenShare, setScreenShare] = useState<boolean>(false);
  const [handRaised, setHandRaised] = useState<boolean>(false);
  const [localMediaStream, setLocalMediaStream] = useState<MediaStream>();
  const [streamError, setStreamError] = useState<string>("");
  const [iceServers, setIceServers] = useState<RTCIceServer[]>();
  const [canJoinMeeting, setCanJoinMeeting] = useState<boolean>(false);
  const [peers, setPeers] = useState<PeersType[]>([]);

  const numberOfParticipant: number = peersRef.current.length;

  const addPeerSound = usePlaySound("addPeer");
  const raisedHandSound = usePlaySound("raiseHand");
  const onlyParticipantSound = usePlaySound("onlyParticipant");

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
      peer_raised_hand: handRaised,
      peer_screen_record: screenRecordRef.current,
      peer_screen_share: screenShare,
    });

    socket.on("clients-in-room", (users: UserObjType[]) => {
      const peers: PeersType[] = [];
      // To all users who are already in the room initiating a peer connection
      users.forEach((user: UserObjType) => {
        if (iceServers !== undefined) {
          const peer = createPeer(
            user.socketId,
            socket.id,
            stream,
            iceServers,
            socket
          );

          addPeerSound.play();
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
        }
      });

      if (peers.length >= 1) {
        onlyParticipantSound.pause();
        onlyParticipantSound.currentTime = 0;
        onlyParticipantSound.loop = false;
      } else {
        onlyParticipantSound.play();
        onlyParticipantSound.loop = true;
      }

      setPeers(peers);
    });

    /**
     * once the users initiate signal we will call add peer
     * to acknowledge the signal and send the stream
     */
    socket.on("user-joined", (payload: UserJoinedPayloadType) => {
      console.log("payload", payload);
      if (iceServers !== undefined) {
        const peer = addPeer(
          payload.signal,
          payload.callerId,
          stream,
          iceServers,
          socket
        );
        peersRef.current.push({
          peerId: payload.user?.socketId,
          peerObj: peer,
          userObj: payload.user,
        });
        setPeers((users: PeersType[]) => [
          ...users,
          { peerId: payload.callerId, peerObj: peer, userObj: payload.user },
        ]);

        if (peersRef.current.length >= 1) {
          onlyParticipantSound.pause();
          onlyParticipantSound.currentTime = 0;
          onlyParticipantSound.loop = false;
        }

        addPeerSound.play();
        enqueueSnackbar(
          <>
            <img
              src={payload.user.avatar}
              alt={payload.user?.peer_name}
              className="w-full max-w-[50px] capitalize"
            />{" "}
            {payload.user?.peer_name} joined meeting
          </>,
          {
            anchorOrigin: {
              vertical: "top",
              horizontal: "center",
            },
          }
        );
      }
    });

    /**
     *  once the signal is accepted calling the signal with signal
     *from other user so that stream can flow between peers
     */
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

      if (peers.length >= 1) {
        onlyParticipantSound.pause();
        onlyParticipantSound.currentTime = 0;
        onlyParticipantSound.loop = false;
      } else {
        onlyParticipantSound.play();
        onlyParticipantSound.loop = true;
      }

      enqueueSnackbar(`${item.userObj.peer_name} Left meeting`, {
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "left",
        },
      });

      peersRef.current = peers;
      setPeers(peers);
    });

    /**
     * Relay peer actions
     */
    socket.on("peerActionStatus", (payload: PeerActionStatusConfig) => {
      setPeers((peers: PeersType[]) => {
        const peerIndex = peers.findIndex(
          (peer: PeersType) => peer.peerId === payload.socket_id
        );
        const newPeer: PeersType[] = [...peers];

        const peerItem: PeersType = newPeer[peerIndex];

        if (peerItem) {
          switch (payload.element) {
            case "video":
              peerItem.userObj.peer_video = payload.status as boolean;
              break;
            case "audio":
              peerItem.userObj.peer_audio = payload.status as boolean;
              break;
            case "screen":
              peerItem.userObj.peer_screen_share = payload.status as boolean;
              break;
            case "hand":
              peerItem.userObj.peer_raised_hand = payload.status as boolean;
              if (peerItem.userObj.peer_raised_hand) {
                raisedHandSound.play();
                enqueueSnackbar(
                  <>
                    {peerItem.userObj.peer_name} Raised{" "}
                    {genderToPronoun(peerItem.userObj.peer_gender)} Hand{" "}
                    <Icon className="wave-hand">
                      <Iconify
                        icon={`emojione:waving-hand-medium-dark-skin-tone`}
                      />
                    </Icon>
                  </>,
                  {
                    anchorOrigin: {
                      vertical: "top",
                      horizontal: "right",
                    },
                  }
                );
              }
              break;
            case "rec":
              peerItem.userObj.peer_screen_record = payload.status as boolean;
              break;
            case "name":
              peerItem.userObj.peer_name = payload.status as string;
              break;
          }
        }
        peersRef.current = newPeer;
        return newPeer;
      });
    });
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
    if (
      canJoinMeeting &&
      localMediaStream !== undefined &&
      iceServers !== undefined
    ) {
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

  function toggleCameraFn() {
    toggleCamera(localMediaStream, setCamera, function (camera) {
      setCamera((camera) => {
        socket.emit("peerActionStatus", {
          room_id: meetId,
          socket_id: socket.id,
          element: "video",
          status: camera,
        } as PeerActionStatusConfig);
        return camera;
      });

      enqueueSnackbar(
        <>
          <Icon style={{ color: `${ThemeConfig.palette.common.white}` }}>
            <Iconify
              icon={`${
                camera
                  ? "heroicons:video-camera-solid"
                  : "heroicons:video-camera-slash-solid"
              }`}
            />
          </Icon>{" "}
          {camera ? "Camera turned on" : "Camera turned off"}
        </>,
        {
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        }
      );
    });
  }

  function toggleAudioFn() {
    toggleAudio(localMediaStream, setMic, function (mic) {
      socket.emit("peerActionStatus", {
        room_id: meetId,
        socket_id: socket.id,
        element: "audio",
        status: mic,
      } as PeerActionStatusConfig);

      enqueueSnackbar(
        <>
          <Icon style={{ color: `${ThemeConfig.palette.common.white}` }}>
            <Iconify
              icon={`${
                mic
                  ? "clarity:microphone-solid"
                  : "clarity:microphone-mute-solid"
              }`}
            />
          </Icon>
          {mic ? "Microphone turned on" : "Microphone turned off"}
        </>,
        {
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        }
      );
    });
  }

  function hangUpFn() {
    hangUp(localMediaStream);
    navigate("/");
    socket.disconnect();
  }

  function onInputChangeNameFn(e: React.ChangeEvent<HTMLInputElement>) {
    formik.setFieldValue("name", e.target.innerHTML);
    socket.emit("peerActionStatus", {
      room_id: meetId,
      socket_id: socket.id,
      element: "name",
      status: e.target.innerHTML,
    } as PeerActionStatusConfig);
  }

  function raiseHandFn() {
    setHandRaised((handRaised) => {
      socket.emit("peerActionStatus", {
        room_id: meetId,
        socket_id: socket.id,
        element: "hand",
        status: !handRaised,
      } as PeerActionStatusConfig);
      if (!handRaised) {
        raisedHandSound.play();
      }
      enqueueSnackbar(`${!handRaised ? "Hand Raised ✋" : "Hand Down ✋"}`, {
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
      return !handRaised;
    });
  }

  /**
   * Enable - disable screen sharing
   * https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia
   */
  async function toggleScreenSharing() {
    const constraints = {
      // audio: true, // enable tab audio
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
      },
      // video: { frameRate: { max: screenMaxFrameRate } },
      video: true,
    };

    let screenMediaPromise: MediaStream;

    try {
      if (!screenRecordRef.current) {
        // on screen sharing start
        screenMediaPromise = await navigator.mediaDevices.getDisplayMedia(
          constraints
        );
      } else {
        // on screen sharing stop
        screenMediaPromise = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
      }
      if (screenMediaPromise) {
        console.log("screenMediaPromise", screenMediaPromise);
        screenRecordRef.current = !screenRecordRef.current;
        socket.emit("peerActionStatus", {
          room_id: meetId,
          socket_id: socket.id,
          element: "screen",
          status: !screenRecordRef,
        } as PeerActionStatusConfig);

        setLocalMediaStream(screenMediaPromise);

        // await stopLocalVideoTrack();
        // await refreshMyLocalStream(screenMediaPromise);
        // await refreshMyStreamToPeers(screenMediaPromise);
      }
    } catch (err) {
      console.error("[Error] Unable to share the screen", err);
    }
  }

  function shareScreenFn() {
    toggleScreenSharing();
  }

  if (canJoinMeeting) {
    return (
      <LoadingContent
        loading={getTurnServerQuery.loading || getAvatarQuery.loading}
        error={!!getTurnServerQuery.error || !!getAvatarQuery.error}
      >
        <VideoMeet
          camera={camera}
          hand={handRaised}
          mic={mic}
          toggleCamera={toggleCameraFn}
          raiseHand={raiseHandFn}
          toggleAudio={toggleAudioFn}
          hangUp={hangUpFn}
          shareScreen={shareScreenFn}
          onInputName={onInputChangeNameFn}
          localMediaStream={localMediaStream}
          formik={formik}
          peers={peers}
          getAvatarQuery={getAvatarQuery}
        />
      </LoadingContent>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <AppHeader />
      <LoadingContent
        loading={getTurnServerQuery.loading}
        error={!!getTurnServerQuery.error}
      >
        <Container maxWidth="xl" className="flex min-h-screen items-center">
          <div className="grid grid-cols-3 gap-10 w-full">
            <VideoMeetJoinForm formik={formik} />
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
                  <VideoMeetJoinVideoPreviewerBody streamError={streamError} />
                }
                footer={
                  <VideoMeetJoinVideoPreviewerFooter
                    camera={camera}
                    toggleCamera={() => {
                      toggleCamera(localMediaStream, setCamera, (camera) =>
                        camera
                          ? setStreamError("")
                          : setStreamError("Camera is turned off")
                      );
                    }}
                    mic={mic}
                    toggleAudio={() => {
                      toggleAudio(localMediaStream, setMic);
                    }}
                  />
                }
              />
            </div>
          </div>
        </Container>
      </LoadingContent>
    </div>
  );
}

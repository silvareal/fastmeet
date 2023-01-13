import { Icon } from "@mui/material";
import { GlobalInitialStateType, UseQueryStateResult } from "common/GlobalType";
import ThemeConfig from "configs/ThemeConfig";
import {
  PeerActionStatusConfig,
  PeersType,
} from "features/videoMeet/VideoMeetType";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addPeerAction,
  editPeerAction,
  removePeerAction,
  toggleCameraAction,
  toggleHandRaisedAction,
  toggleMicAction,
} from "store/StoreSlice";
import { initEnumerateDevices, socket } from "utils/VideoUtils";
import { Icon as Iconify } from "@iconify/react";
import { useSnackbar } from "notistack";
import usePlaySound from "./usePlaySound";
import escape from "lodash/escape";
import fastmeetApi from "store/StoreQuerySlice";

function useMeeting(
  meetId: string | undefined,
  { canJoinMeeting }: { canJoinMeeting?: boolean }
): GlobalInitialStateType & {
  streamError: string;
  toggleMic: (callback?: (mic: boolean) => void) => void;
  toggleCamera: (callback?: (camera: boolean) => void) => void;
  hangUp: () => void;
  raiseHand: () => void;
  onInputChangeName: (e: React.ChangeEvent<HTMLInputElement>) => void;
  addPeer: (peer: PeersType) => void;
  editPeer: (peer: PeersType) => void;
  deletePeer: (peer: PeersType) => void;
  setStreamError: Function;
  iceServers: RTCIceServer[];
  peers: PeersType[];
  setPeers: Dispatch<SetStateAction<PeersType[]>>;
  getTurnServerQuery: UseQueryStateResult<{ data: { [key: string]: string } }>;
} {
  const globalState: GlobalInitialStateType = useSelector(
    (state: any) => state.global
  );

  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const [streamError, setStreamError] = useState<string>("");
  const [localMediaStream, setLocalMediaStream] = useState<MediaStream>();
  const [peers, setPeers] = useState<PeersType[]>([]);

  const camera = globalState.camera;
  const mic = globalState.mic;
  const handRaised = globalState.handRaised;
  const screenShare = globalState.screenShare;
  //   const peers = globalState.peers;
  const iceServers = globalState.iceServers;

  const raisedHandSound = usePlaySound("raiseHand");

  const getTurnServerQuery = fastmeetApi.useGetTurnServerQuery({});

  useEffect(() => {
    if (!!iceServers) {
      initEnumerateDevices(
        setStreamError,
        (stream) => {
          setLocalMediaStream(stream);
          dispatch(toggleCameraAction(true));
          dispatch(toggleMicAction(true));
        },
        () => {
          dispatch(toggleCameraAction(false));
          dispatch(toggleMicAction(false));
        }
      );
    }
  }, [iceServers]);

  function toggleCamera(callback?: (camera: boolean) => void) {
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/getVideoTracks
    if (localMediaStream !== undefined) {
      localMediaStream.getVideoTracks()[0].enabled =
        !localMediaStream.getVideoTracks()[0].enabled;
      if (callback) callback(!!localMediaStream.getVideoTracks()[0].enabled);
      dispatch(
        toggleCameraAction(!!localMediaStream.getVideoTracks()[0].enabled)
      );
      if (canJoinMeeting) {
        socket.emit("peerActionStatus", {
          room_id: meetId,
          socket_id: socket.id,
          element: "video",
          status: camera,
        } as PeerActionStatusConfig);
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
      }
    }
  }

  function toggleMic(callback?: (mic: boolean) => void) {
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/getAudioTracks
    if (localMediaStream !== undefined) {
      localMediaStream.getAudioTracks()[0].enabled =
        !localMediaStream.getAudioTracks()[0].enabled;
      if (callback) callback(!!localMediaStream.getAudioTracks()[0].enabled);
      dispatch(toggleMicAction(!!localMediaStream.getAudioTracks()[0].enabled));
      if (canJoinMeeting) {
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
      }
    }
  }

  function hangUp() {
    if (!canJoinMeeting) return;
    if (localMediaStream !== undefined) {
      localMediaStream.getVideoTracks()[0].enabled =
        !localMediaStream.getVideoTracks()[0].enabled;
    }
    socket.disconnect();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }

  function raiseHand() {
    if (!canJoinMeeting) return;
    console.log("!handRaised, !handRaised", !handRaised);
    socket.emit("peerActionStatus", {
      room_id: meetId,
      socket_id: socket.id,
      element: "hand",
      status: !handRaised,
    } as PeerActionStatusConfig);
    dispatch(toggleHandRaisedAction(!handRaised));
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
  }

  function onInputChangeName(e: React.ChangeEvent<HTMLInputElement>) {
    const sanitizedText = escape(e.target.value);

    socket.emit("peerActionStatus", {
      room_id: meetId,
      socket_id: socket.id,
      element: "name",
      status: sanitizedText,
    } as PeerActionStatusConfig);
  }

  function addPeer(peer: PeersType) {
    dispatch(addPeerAction(peer));
  }
  function editPeer(peer: PeersType) {
    dispatch(editPeerAction(peer));
  }
  function deletePeer(peer: PeersType) {
    dispatch(removePeerAction(peer));
  }

  return {
    camera,
    mic,
    handRaised,
    screenShare,
    localMediaStream,
    peers,
    streamError,
    toggleMic,
    toggleCamera,
    hangUp,
    raiseHand,
    onInputChangeName,
    addPeer,
    editPeer,
    deletePeer,
    setPeers,
    iceServers,
    setStreamError,
    getTurnServerQuery,
  };
}

export default useMeeting;

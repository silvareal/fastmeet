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
  toggleMicAction,
} from "store/StoreSlice";
import { initEnumerateDevices, socket } from "utils/VideoUtils";
import { Icon as Iconify } from "@iconify/react";
import { useSnackbar } from "notistack";
import usePlaySound from "./usePlaySound";
import escape from "lodash/escape";
import fastmeetApi from "store/StoreQuerySlice";
import useExtendedState from "./useExtendedState";

function useMeeting(
  meetId: string | undefined,
  { canJoinMeeting }: { canJoinMeeting?: boolean }
): GlobalInitialStateType & {
  streamError: string;
  toggleMic: (callback?: (mic: boolean) => void) => void;
  toggleCamera: (callback?: (camera: boolean) => void) => void;
  hangUp: () => void;
  raiseHand: () => void;
  onInputChangeName: (
    e: React.ChangeEvent<HTMLInputElement>,
    callback?: (value: string) => void
  ) => void;
  addPeer: (peer: PeersType) => void;
  editPeer: (peer: PeersType) => void;
  deletePeer: (peer: PeersType) => void;
  setStreamError: Function;
  iceServers: RTCIceServer[];
  peers: PeersType[];
  setPeers: Dispatch<SetStateAction<PeersType[]>>;
  getTurnServerQuery: UseQueryStateResult<{ data: { [key: string]: string } }>;
  toggleScreenSharing: () => void;
} {
  const globalState: GlobalInitialStateType = useSelector(
    (state: any) => state.global
  );

  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const [peers, setPeers] = useState<PeersType[]>([]);
  const [streamError, setStreamError] = useState<string>("");

  const [localMediaStream, setLocalMediaStream] =
    useExtendedState<MediaStream>();
  const [handRaised, setHandRaised] = useExtendedState<boolean>(false);
  const [screenShare, setScreenShare, getScreenShare] =
    useExtendedState<boolean>(false);

  const camera = globalState.camera;
  const mic = globalState.mic;

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

  async function toggleCamera(callback?: (camera: boolean) => void) {
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/getVideoTracks
    if (localMediaStream !== undefined) {
      localMediaStream.getVideoTracks()[0].enabled =
        !localMediaStream.getVideoTracks()[0].enabled;
      console.log(
        "localMediaStream.getVideoTracks()[0].enabled",
        localMediaStream.getVideoTracks()[0].enabled
      );
      dispatch(
        toggleCameraAction(!!localMediaStream.getVideoTracks()[0].enabled)
      );
      if (canJoinMeeting) {
        socket.emit("peerActionStatus", {
          room_id: meetId,
          socket_id: socket.id,
          element: "video",
          status: !!localMediaStream.getVideoTracks()[0].enabled,
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

      if (callback) callback(!!localMediaStream.getVideoTracks()[0].enabled);
    }
  }

  async function toggleMic(callback?: (mic: boolean) => void) {
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/getAudioTracks
    if (localMediaStream !== undefined) {
      localMediaStream.getAudioTracks()[0].enabled =
        !localMediaStream.getAudioTracks()[0].enabled;
      dispatch(toggleMicAction(!!localMediaStream.getAudioTracks()[0].enabled));
      if (canJoinMeeting) {
        socket.emit("peerActionStatus", {
          room_id: meetId,
          socket_id: socket.id,
          element: "audio",
          status: !!localMediaStream.getAudioTracks()[0].enabled,
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
      if (callback) callback(!!localMediaStream.getAudioTracks()[0].enabled);
    }
  }

  /**
   * Refresh my local stream
   * @param {object} stream media stream audio - video
   * @param {boolean} localAudioTrackChange default false
   */
  async function refreshMyLocalStream(
    stream: MediaStream,
    localAudioTrackChange = false
  ) {
    if (localMediaStream === undefined) return;

    if (screenShare) stream.getVideoTracks()[0].enabled = true;

    let newStream = null;

    // https://developer.mozilla.org/en-US/docs/Web/API/MediaStream
    if (!screenShare) {
      console.log("Refresh my local media stream VIDEO - AUDIO");
      newStream = new MediaStream([
        stream.getVideoTracks()[0],
        localAudioTrackChange
          ? stream.getAudioTracks()[0]
          : localMediaStream.getAudioTracks()[0],
      ]);
    } else {
      console.log("Refresh my local media stream AUDIO");
      newStream = new MediaStream([
        localAudioTrackChange
          ? stream.getAudioTracks()[0]
          : localMediaStream.getAudioTracks()[0],
      ]);
    }
    setLocalMediaStream(newStream);

    getScreenShare().then((isScreenShare) => {
      if (!isScreenShare) {
        stream.getVideoTracks()[0].onended = () => {
          toggleScreenSharing();
        };
        localMediaStream.getVideoTracks()[0].enabled = false;
      }
    });
  }

  /**
   * Replace Video Tracks
   * @param {object} stream media stream audio - video
   * @param {object} recipientPeer
   */
  function replaceVideoTrack(stream: MediaStream, recipientPeer: any) {
    recipientPeer.replaceTrack(
      recipientPeer.streams[0].getVideoTracks()[0],
      stream.getVideoTracks()[0],
      recipientPeer.streams[0]
    );
  }

  /**
   * Enable - disable screen sharing
   * https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia
   */
  async function toggleScreenSharing() {
    getScreenShare().then(async (isScreenShare) => {
      const constraints = {
        // audio: true, // enable tab audio
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          cursor: "always",
        },
        //   video: { frameRate: { max: screenMaxFrameRate } },
        video: true,
      };

      let screenMediaPromise: MediaStream;

      try {
        if (isScreenShare === false) {
          // on screen sharing start
          console.log("on screen sharing start");
          screenMediaPromise = await navigator.mediaDevices.getDisplayMedia(
            constraints
          );
        } else {
          // on screen sharing stop
          console.log("on screen sharing stop");
          screenMediaPromise = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
          });
        }
        if (screenMediaPromise) {
          console.log("call refresh localstream");
          await refreshMyLocalStream(screenMediaPromise);
          setPeers((peers) => {
            let newPeers = [...peers];
            newPeers.forEach((peer) =>
              replaceVideoTrack(screenMediaPromise, peer.peerObj)
            );
            return newPeers;
          });

          socket.emit("peerActionStatus", {
            room_id: meetId,
            socket_id: socket.id,
            element: "screen",
            status: !isScreenShare,
          } as PeerActionStatusConfig);
        }
        setScreenShare(!isScreenShare);
      } catch (err) {
        console.error("[Error] Unable to share the screen", err);
      }
    });
  }

  function hangUp() {
    if (canJoinMeeting) {
      if (localMediaStream !== undefined) {
        localMediaStream.getVideoTracks()[0].enabled =
          !localMediaStream.getVideoTracks()[0].enabled;
      }
      socket.disconnect();
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  }

  async function raiseHand() {
    if (canJoinMeeting) {
      setHandRaised((handRaised) => {
        console.log("handRaisedref", handRaised);
        enqueueSnackbar(`${handRaised ? "Hand Raised ✋" : "Hand Down ✋"}`, {
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        });

        if (handRaised) {
          raisedHandSound.play();
        }
        socket.emit("peerActionStatus", {
          room_id: meetId,
          socket_id: socket.id,
          element: "hand",
          status: !handRaised,
        } as PeerActionStatusConfig);

        return !handRaised;
      });
    }
  }

  function onInputChangeName(
    e: React.ChangeEvent<HTMLInputElement>,
    callback?: (value: string) => void
  ) {
    const sanitizedText = escape(e.target.value);
    socket.emit("peerActionStatus", {
      room_id: meetId,
      socket_id: socket.id,
      element: "name",
      status: `${sanitizedText}`,
    } as PeerActionStatusConfig);
    callback && callback(sanitizedText);
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
    toggleScreenSharing,
  };
}

export default useMeeting;

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
import {
  getDataTimeString,
  getSupportedMimeTypes,
  saveBlobToFile,
} from "utils/GLobalUtils";

function useMeeting(
  meetId: string | undefined,
  { canJoinMeeting }: { canJoinMeeting?: boolean }
): GlobalInitialStateType & {
  streamError: string;
  toggleMic: (callback?: (mic: boolean) => void) => void;
  toggleCamera: (callback?: (camera: boolean) => void) => void;
  hangUp: () => void;
  raiseHand: () => void;
  isScreenRecord: boolean;
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
  toggleRecordStream: () => void;
} {
  const globalState: GlobalInitialStateType = useSelector(
    (state: { global: GlobalInitialStateType }) => state.global
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
  const [mediaRecorder, setMediaRecorder, getMediaRecorder] =
    useExtendedState<MediaRecorder>();
  const [isScreenRecord, setIsScreenRecord, getIsScreenRecord] =
    useExtendedState<boolean>(false);
  const [recordedBlobs, setRecordedBlobs, getRecordedBlobs] =
    useExtendedState<any>([]);

  const camera = globalState.camera;
  const mic = globalState.mic;
  const isChatDrawer = globalState.isChatDrawer;

  let isMobileDevice = false;

  const iceServers = globalState.iceServers;

  const raisedHandSound = usePlaySound("raiseHand");
  const screenRecStartSound = usePlaySound("recStart");
  const screenRecStopSound = usePlaySound("recStop");

  //   console.log(
  //     "localMediaStream?.getAudioTracks()",
  //     localMediaStream?.getAudioTracks()[0]
  //   );

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
        (err) => {
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

      if (callback && typeof callback === "function")
        callback(!!localMediaStream.getVideoTracks()[0].enabled);
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
      if (callback && typeof callback === "function")
        callback(!!localMediaStream.getAudioTracks()[0].enabled);
    }
  }

  /**
   * Stop recording
   */
  function stopStreamRecording() {
    getMediaRecorder().then((mediaRecorder) => {
      mediaRecorder.stop();
    });
  }

  /**
   * Download recorded stream
   */
  function downloadRecordedStream() {
    try {
      getRecordedBlobs().then((recordedBlobs) => {
        if (recordedBlobs === undefined) return;
        const type = recordedBlobs[0].type.includes("mp4") ? "mp4" : "webm";
        const blob = new Blob(recordedBlobs, { type: "video/" + type });
        const recFileName = getDataTimeString() + "-REC." + type;
        const currentDevice = isMobileDevice ? "MOBILE" : "PC";
        console.log(
          `Please wait to be processed, then will be downloaded to your ${currentDevice} device`
        );

        saveBlobToFile(blob, recFileName);
      });
    } catch (err) {
      console.log("error", "Recording save failed: " + err);
    }
  }
  /**
   * Handle Media Recorder onstop event
   * @param {object} event of media recorder
   */
  function handleMediaRecorderStop(event: any) {
    screenRecStopSound.play();
    console.log("MediaRecorder stopped: ", event);
    setIsScreenRecord(false);
    socket.emit("peerActionStatus", {
      room_id: meetId,
      socket_id: socket.id,
      element: "rec",
      status: false,
    } as PeerActionStatusConfig);
    downloadRecordedStream();
  }

  /**
   * Handle Media Recorder ondata event
   * @param {object} event of media recorder
   */
  function handleMediaRecorderData(event: any) {
    console.log("MediaRecorder data: ", event);
    if (event.data && event.data.size > 0)
      setRecordedBlobs((prevRecordedBlobs: any) => {
        return [...prevRecordedBlobs, event.data];
      });
  }

  /**
   * Handle Media Recorder
   * @param {object} mediaRecorder
   */
  function handleMediaRecorder() {
    getMediaRecorder().then((mediaRecorder) => {
      console.log("mediaRecorder", mediaRecorder);
      screenRecStartSound.play();
      mediaRecorder.start();
      mediaRecorder.addEventListener("dataavailable", handleMediaRecorderData);
      mediaRecorder.addEventListener("stop", handleMediaRecorderStop);
    });
  }

  /**
   * Start Recording
   * https://github.com/webrtc/samples/tree/gh-pages/src/content/getusermedia/record
   * https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
   * https://developer.mozilla.org/en-US/docs/Web/API/MediaStream
   */
  function startStreamRecording() {
    setRecordedBlobs([]);

    let mimeoptions = getSupportedMimeTypes();
    console.log("MediaRecorder options supported", mimeoptions);
    let options = { mimeType: mimeoptions?.[0] }; // select the first available as mimeType

    try {
      if (isMobileDevice) {
        // on mobile devices recording camera + audio
        setMediaRecorder(new MediaRecorder(localMediaStream, options));
        setIsScreenRecord(true);
        handleMediaRecorder();
        socket.emit("peerActionStatus", {
          room_id: meetId,
          socket_id: socket.id,
          element: "rec",
          status: true,
        } as PeerActionStatusConfig);
      } else {
        // on desktop devices recording screen + audio
        // screenMaxFrameRate = parseInt(screenFpsSelect.value);
        const constraints = {
          // video: { frameRate: { max: screenMaxFrameRate } },
          video: true,
        };
        let recScreenStreamPromise =
          navigator.mediaDevices.getDisplayMedia(constraints);
        recScreenStreamPromise
          .then((screenStream) => {
            const newStream = new MediaStream([
              screenStream.getVideoTracks()[0],
              localMediaStream.getAudioTracks()[0],
            ]);
            setMediaRecorder(new MediaRecorder(newStream, options));
            setIsScreenRecord(true);
            handleMediaRecorder();
            socket.emit("peerActionStatus", {
              room_id: meetId,
              socket_id: socket.id,
              element: "rec",
              status: true,
            } as PeerActionStatusConfig);
          })
          .catch((err) => {
            console.error(
              "[Error] Unable to recording the screen + audio",
              err
            );
          });
      }
    } catch (err) {
      console.error("Exception while creating MediaRecorder: ", err);
    }
  }

  /**
   * Start - Stop Stream recording
   */
  function toggleRecordStream() {
    getIsScreenRecord().then((isStreamRecording) => {
      if (isStreamRecording) {
        stopStreamRecording();
      } else {
        startStreamRecording();
      }
    });
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
      console.log("handRaised1", handRaised);
      setHandRaised((handRaised) => {
        console.log("handRaisedref", handRaised);
        enqueueSnackbar(`${!handRaised ? "Hand Raised ✋" : "Hand Down ✋"}`, {
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
      console.log("handRaised2", handRaised);
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
    if (callback && typeof callback === "function") callback(sanitizedText);
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
    isChatDrawer,
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
    isScreenRecord,
    deletePeer,
    setPeers,
    iceServers,
    setStreamError,
    getTurnServerQuery,
    toggleRecordStream,
    toggleScreenSharing,
  };
}

export default useMeeting;

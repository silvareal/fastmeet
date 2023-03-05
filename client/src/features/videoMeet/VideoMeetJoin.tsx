import { Container, Icon } from "@mui/material";
import React, { useRef, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { Icon as Iconify } from "@iconify/react";

import AppHeader from "AppHeader";
import VideoPreviewer from "common/VideoPreviewer";
import { getPeerInfo, addPeerSignal, createPeer } from "./VideoMeetCommon";
import VideoMeetJoinVideoPreviewerBody from "./VideoMeetJoinVideoPreviewerBody";
import VideoMeetJoinVideoPreviewerHeader from "./VideoMeetJoinVideoPreviewerHeader";
import VideoMeetJoinVideoPreviewerFooter from "./VideoMeetJoinVideoPreviewerFooter";
import VideoMeet from "./VideoMeet";
import LoadingContent from "common/LoadingContent";
import VideoMeetJoinForm from "./VideoMeetJoinForm";
import { genderToPronoun } from "utils/GLobalUtils";
import usePlaySound from "hooks/usePlaySound";
import { socket } from "utils/VideoUtils";
import useMeeting from "hooks/useMeeting";
import fastmeetApi from "store/StoreQuerySlice";
import {
  PeersType,
  UserObjType,
  UserJoinedPayloadType,
  PeersRefType,
  PeerActionStatusConfig,
} from "./VideoMeetType";
import ScreenRecorderContainer from "common/ScreenRecorderContainer";

export default function VideoMeetJoin() {
  const { meetId } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const peersRef: { current: any } = useRef([]);
  const screenRecordRef: { current: any } = useRef<boolean>(false);

  const [canJoinMeeting, setCanJoinMeeting] = useState<boolean>(false);

  const addPeerSound = usePlaySound("addPeer");
  const raisedHandSound = usePlaySound("raiseHand");
  const onlyParticipantSound = usePlaySound("onlyParticipant");
  const screenShareSound = usePlaySound("newMessage");
  const screenRecStartSound = usePlaySound("recStart");
  const screenRecStopSound = usePlaySound("recStop");

  const {
    localMediaStream,
    handRaised,
    streamError,
    mic,
    peers,
    setPeers,
    camera,
    screenShare,
    toggleCamera,
    toggleRecordStream,
    isScreenRecord,
    toggleMic,
    hangUp,
    raiseHand,
    iceServers,
    setStreamError,
    onInputChangeName,
    getTurnServerQuery,
    toggleScreenSharing,
  } = useMeeting(meetId, { canJoinMeeting });

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

  const getAvatarQuery = fastmeetApi.useGetAvatarQuery({
    category: formik.values.gender,
  });

  const getAvatarResult = getAvatarQuery.data as { data: string };

  /**
   * join to channel and send some peer info
   * @param stream MediaStream
   */
  function joinToChannel(stream: MediaStream) {
    socket.emit("join", meetId, {
      userAgent: navigator.userAgent.toLowerCase(),
      channel_password: "",
      avatar: getAvatarResult?.data,
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
      peersRef.current = peers;
      setPeers(peers);
    });

    /**
     * once the users initiate signal we will call add peer
     * to acknowledge the signal and send the stream
     */
    socket.on("user-joined", (payload: UserJoinedPayloadType) => {
      if (iceServers !== undefined) {
        const peer = addPeerSignal(
          payload.signal,
          payload.callerId,
          stream,
          iceServers,
          socket
        );
        peersRef.current.push({
          peerId: payload.callerId,
          peerObj: peer,
          userObj: payload.user,
        });
        setPeers((peers: PeersType[]) => {
          const users = [...peers];

          const newUserIndex = users.findIndex(
            (user) => user.peerId === payload.callerId
          );
          if (newUserIndex !== undefined) {
            users[newUserIndex] = {
              peerId: payload.callerId,
              peerObj: peer,
              userObj: payload.user,
            };
            return users;
          } else {
            return [
              ...users,
              {
                peerId: payload.callerId,
                peerObj: peer,
                userObj: payload.user,
              },
            ];
          }
        });

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
      console.log("peerActionStatus", payload);
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
              screenShareSound.play();
              enqueueSnackbar(
                <>
                  {peerItem.userObj.peer_name} `$
                  {payload.status ? "Started" : "Stopped"}`Sharing Screen
                </>,
                {
                  anchorOrigin: {
                    vertical: "top",
                    horizontal: "right",
                  },
                }
              );

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
              if (peerItem.userObj.peer_screen_record) {
                screenRecStartSound.play();
                enqueueSnackbar(
                  <>{peerItem.userObj.peer_name} started 🔴 REC</>,
                  {
                    anchorOrigin: {
                      vertical: "top",
                      horizontal: "right",
                    },
                  }
                );
              } else {
                screenRecStopSound.play();
                enqueueSnackbar(
                  <>{peerItem.userObj.peer_name} stopped 🔴 REC</>,
                  {
                    anchorOrigin: {
                      vertical: "top",
                      horizontal: "right",
                    },
                  }
                );
              }
              break;
            case "name":
              peerItem.userObj.peer_name = payload.status as string;
              break;
          }
        }
        peersRef.current = newPeer;
        console.log("newPeer", newPeer);
        return newPeer;
      });
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
  }, [canJoinMeeting]);

  useEffect(() => {
    return () => {
      onlyParticipantSound.pause();
    };
  }, []);

  if (canJoinMeeting) {
    return (
      <>
        <LoadingContent
          loading={getTurnServerQuery.isLoading || getAvatarQuery.isLoading}
          error={!!getTurnServerQuery.error || !!getAvatarQuery.error}
        >
          <>
            {isScreenRecord ? <ScreenRecorderContainer /> : null}
            <VideoMeet
              {...{
                camera,
                mic,
                toggleCamera,
                raiseHand,
                hangUp,
                formik,
                peers,
                setPeers, // TODO: remove
                peersRef, // TODO: remove
                isScreenRecord,
                localMediaStream,
                getAvatarQuery,
                screenShare,
                toggleRecordStream,
                toggleScreenSharing,
                hand: handRaised,
                toggleAudio: toggleMic,
                onInputName: onInputChangeName,
              }}
            />
          </>
        </LoadingContent>
      </>
    );
  }

  return (
    <div className="bg-gray-100  min-h-screen">
      <AppHeader />
      <div className="my-8">
        <LoadingContent
          loading={getTurnServerQuery.isLoading}
          error={!!getTurnServerQuery.error}
        >
          <Container maxWidth="xl" className="flex min-h-screen items-center">
            <div className="flex md:flex-row flex-col-reverse gap-10 w-full">
              <div className="md:w-[40%] w-full">
                <VideoMeetJoinForm formik={formik} />
              </div>

              <div className="md:h-[450px] h-[300px] md:w-[60%] w-full">
                <VideoPreviewer
                  camera={camera}
                  mic={mic}
                  muted={true}
                  active={true}
                  srcObject={localMediaStream}
                  // header={
                  //   <VideoMeetJoinVideoPreviewerHeader
                  //     localMediaStream={localMediaStream}
                  //   />
                  // }
                  body={
                    <VideoMeetJoinVideoPreviewerBody
                      streamError={streamError}
                    />
                  }
                  footer={
                    <VideoMeetJoinVideoPreviewerFooter
                      camera={camera}
                      toggleCamera={() => {
                        toggleCamera((camera) => {
                          camera
                            ? setStreamError("")
                            : setStreamError("Camera is turned off");
                        });
                      }}
                      mic={mic}
                      toggleAudio={toggleMic}
                    />
                  }
                />
              </div>
            </div>
          </Container>
        </LoadingContent>
      </div>
    </div>
  );
}

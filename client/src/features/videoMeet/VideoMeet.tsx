import { Icon as Iconify } from "@iconify/react";
import {
  Badge,
  Fab,
  Icon,
  InputBase,
  IconButton,
  styled,
  Tooltip,
  Typography,
  useMediaQuery,
  BottomNavigation,
} from "@mui/material";
import { format } from "date-fns";
import { FormikProps } from "formik";
import React, { useMemo, useState } from "react";

import VideoPreviewer from "common/VideoPreviewer";
import ThemeConfig from "configs/ThemeConfig";
import { MessageDetailsType } from "features/chat/ChatType";
import usePlaySound from "hooks/usePlaySound";
import { useSnackbar } from "notistack";
import "./VideoMeet.css";
import { PeersRefType, PeersType } from "./VideoMeetType";
import { ChatDrawer } from "features/chat/ChatDrawer";
import { APP_SIDE_MENU_WIDTH } from "constants/Global";
import useChatDrawer from "hooks/useChatDrawer";
import VoicePitch from "common/VoicePitch";

const PreviewInput = styled(InputBase)(({ theme }) => ({
  "& .MuiInputBase-input": {
    position: "relative",
    backgroundColor: "transparent",
    border: "none",
    width: "auto",
    padding: ".2rem .5rem",
    color: "white",
    fontSize: "0.75rem",
  },
}));

interface VideoMeetProps {
  toggleCamera: () => void;
  toggleAudio: () => void;
  toggleRecordStream: () => void;
  hangUp: () => void;
  raiseHand: () => void;
  toggleScreenSharing: () => void;
  mic: boolean;
  camera: boolean;
  hand: boolean;
  screenShare: boolean;
  isScreenRecord: boolean;
  localMediaStream: MediaStream | undefined;
  peers: PeersType[];
  setPeers: Function;
  peersRef: { current: PeersRefType[] };
  formik: FormikProps<{
    name: string;
    gender: string;
    meetId: string | undefined;
  }>;
  getAvatarQuery: any;
  onInputName: (
    e: React.ChangeEvent<HTMLInputElement>,
    callback?: (value: string) => void
  ) => void;
}

interface MainActionProps {
  title: string;
  variant: "circular" | "extended" | "opaque";
  color: "error" | "primary";
  onClick: () => void;
  size: "small" | "medium" | "large";
  icon: string;
  isMobile?: boolean;
}

export default function VideoMeet({
  toggleCamera,
  toggleAudio,
  raiseHand,
  hangUp,
  toggleScreenSharing,
  mic,
  camera,
  hand,
  toggleRecordStream,
  isScreenRecord,
  screenShare,
  localMediaStream,
  peers,
  setPeers,
  peersRef,
  formik,
  getAvatarQuery,
  onInputName,
}: VideoMeetProps) {
  const isMobile = useMediaQuery(ThemeConfig.breakpoints.down("md"));
  const mainActions: MainActionProps[] = useMemo(
    () => [
      {
        title: `${mic ? "Off Mic" : "On Mic"}`,
        variant: "opaque",
        color: `${mic ? "primary" : "error"}`,
        onClick: toggleAudio,
        size: "small",
        isMobile: true,
        icon: `${mic ? "carbon:microphone" : "carbon:microphone-off"}`,
      },
      {
        title: `${camera ? "Off Camera" : "On Camera"}`,
        variant: "opaque",
        color: `${camera ? "primary" : "error"}`,
        onClick: toggleCamera,
        size: "small",
        isMobile: true,
        icon: `${camera ? "bi:camera-video" : "bi:camera-video-off"}`,
      },
      {
        title: `${hand ? "End Raise Hand" : "Raise Hand"}`,
        variant: "opaque",
        color: "primary",
        onClick: raiseHand,
        size: "small",
        isMobile: true,
        icon: "emojione-monotone:hand-with-fingers-splayed",
      },
      {
        title: "Share Screen",
        variant: "opaque",
        color: "primary",
        onClick: toggleScreenSharing,
        size: "small",
        icon: "fluent:share-screen-start-24-regular",
      },
      {
        title: `${isScreenRecord ? "End Record" : "Record"}`,
        variant: "opaque",
        color: `${isScreenRecord ? "error" : "primary"}`,
        onClick: toggleRecordStream,
        size: "small",
        icon: "mdi:record-circle-outline",
      },
      {
        title: "End Call",
        variant: "opaque",
        color: "error",
        onClick: hangUp,
        size: "small",
        isMobile: true,
        icon: "simple-line-icons:call-end",
      },
      // {
      //   title: "Layout",
      //   variant: "opaque",
      //   color: "primary",
      //   onClick: hangUp,
      //   size: "medium",
      //   icon: "tabler:layout-grid",
      // },
    ],
    // eslint-disable-next-line
    [camera, mic, isScreenRecord, hand]
  );

  const onChangePreviewName = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputName(e, (value) => {
      formik.setFieldValue("name", value);
    });
  };

  const { enqueueSnackbar } = useSnackbar();
  const chatMessageSound = usePlaySound("chatMessage");
  const [messages, setMessages] = useState<MessageDetailsType[]>([]);
  const { isChatDrawer, toggleChatDrawer } = useChatDrawer();

  const hasUnreadMessages = messages
    .map((message) => message.isMessageRead)
    .includes(false);

  const toggleOpenChatDrawer = () => {
    toggleChatDrawer?.();

    if (!isChatDrawer === true) {
      const readMessages = messages.map((message) => {
        return { ...message, isMessageRead: true };
      });
      setMessages(readMessages);
    }
    return !isChatDrawer;
  };

  const updateMessages = (message: MessageDetailsType) => {
    console.log(
      "isChatDrawer",
      isChatDrawer,
      isChatDrawer === false,
      !!message.senderDetails?.isFromMe
    );
    if (isChatDrawer && !message.senderDetails?.isFromMe) {
      enqueueSnackbar(
        ` you have a message from ${message?.senderDetails?.userName} 💬`,
        {
          anchorOrigin: {
            vertical: "top",
            horizontal: "right",
          },
        }
      );
      chatMessageSound.play();
    }
    const incomingMessage: MessageDetailsType = {
      ...message,
      isMessageRead: isChatDrawer ? true : false,
    };
    setMessages([...messages, incomingMessage]);

    return;
  };

  return (
    <>
      <div className="bg-[#000000]  h-screen max-h-screen min-h-[500px] flex">
        <div
          className="w-100 border-box w-full"
          style={{
            paddingRight:
              !isMobile && isChatDrawer ? `calc(${APP_SIDE_MENU_WIDTH}px)` : "",
          }}
        >
          <main className="overflow-y-scroll h-full w-100">
            <div
              className={`${
                isMobile
                  ? "h-full max-h-[calc(100vh-56px)] overflow-y-scroll flex justify-center items-center"
                  : "h-[calc(100vh-80px)]"
              } pt-5 px-3 flex gap-2 w-full`}
            >
              {peers.length >= 1 ? (
                <div className="layout-grid-auto h-full">
                  <VideoPreviewer
                    camera={camera}
                    mic={mic}
                    muted={true}
                    active={true}
                    name={formik.values.name}
                    avatar={getAvatarQuery.data.data}
                    srcObject={localMediaStream}
                    header={
                      <div className="flex justify-between items-center">
                        <Icon
                          style={{
                            color: `${
                              mic
                                ? ThemeConfig.palette.common.white
                                : ThemeConfig.palette.error
                            }`,
                          }}
                        >
                          <Iconify
                            icon={`${
                              mic
                                ? "clarity:microphone-solid"
                                : "clarity:microphone-mute-solid"
                            }`}
                          />
                        </Icon>

                        <VoicePitch stream={localMediaStream} />
                      </div>
                    }
                    footer={
                      <div className="flex gap-2">
                        {hand && (
                          <Tooltip title="Hand Raised" placement="top">
                            <Icon className="wave-hand">
                              <Iconify
                                icon={`emojione:waving-hand-medium-dark-skin-tone`}
                              />
                            </Icon>
                          </Tooltip>
                        )}
                        <PreviewInput
                          value={formik.values.name || ""}
                          onChange={onChangePreviewName}
                        />
                      </div>
                    }
                  />
                  {peers?.map((peer: PeersType, index: number) => (
                    <VideoPreviewer
                      key={index}
                      camera={peer.userObj.peer_video}
                      mic={peer.userObj.peer_audio}
                      // muted={false}
                      active={false}
                      avatar={peer.userObj.avatar}
                      peer={peer.peerObj}
                      name={peer.userObj.peer_name}
                      header={
                        <div className="flex justify-between items-center">
                          <Icon
                            style={{
                              color: `${
                                mic
                                  ? ThemeConfig.palette.common.white
                                  : ThemeConfig.palette.error
                              }`,
                            }}
                          >
                            <Iconify
                              icon={`${
                                peer.userObj.peer_audio
                                  ? "clarity:microphone-solid"
                                  : "clarity:microphone-mute-solid"
                              }`}
                            />
                          </Icon>

                          <VoicePitch stream={localMediaStream} />
                        </div>
                      }
                      footer={
                        <div className="flex gap-2">
                          {peer.userObj.peer_raised_hand && (
                            <Tooltip title="Hand Raised" placement="top">
                              <Icon className="wave-hand">
                                <Iconify
                                  icon={`emojione:waving-hand-medium-dark-skin-tone`}
                                />
                              </Icon>
                            </Tooltip>
                          )}
                          <Typography
                            className="vids-preview-title"
                            color={"white"}
                            variant="subtitle2"
                          >
                            {peer.userObj.peer_name}
                          </Typography>
                        </div>
                      }
                    />
                  ))}
                </div>
              ) : (
                <VideoPreviewer
                  className={`${
                    isMobile ? "h-full max-h-[300px]" : "h-[calc(100vh-100px)]"
                  }`}
                  camera={camera}
                  mic={mic}
                  muted={true}
                  active={true}
                  name={formik.values.name}
                  avatar={getAvatarQuery.data.data}
                  srcObject={localMediaStream}
                  header={
                    <div className="flex justify-between items-center">
                      <Icon
                        style={{ color: `${ThemeConfig.palette.common.white}` }}
                      >
                        <Iconify
                          icon={`${
                            mic
                              ? "clarity:microphone-solid"
                              : "clarity:microphone-mute-solid"
                          }`}
                        />
                      </Icon>
                      <VoicePitch stream={localMediaStream} />
                    </div>
                  }
                  footer={
                    <div className="flex gap-2">
                      {hand && (
                        <Tooltip title="Hand Raised" placement="top">
                          <Icon className="wave-hand">
                            <Iconify
                              icon={`emojione:waving-hand-medium-dark-skin-tone`}
                            />
                          </Icon>
                        </Tooltip>
                      )}
                      <PreviewInput
                        value={formik.values.name || ""}
                        onChange={onChangePreviewName}
                      />
                    </div>
                  }
                />
              )}
            </div>
          </main>

          {!isMobile && (
            <footer className="flex justify-between gap-2 items-center fixed w-full bottom-0 z-50 my-3 px-3">
              <div className="flex item-center">
                <Typography color="white" variant="subtitle1" fontWeight={500}>
                  {format(new Date(), "p")} | Fast Meet
                </Typography>
              </div>
              <div className="flex gap-2">
                {mainActions.map((action: MainActionProps, i: number) => (
                  <Tooltip key={i} title={action.title}>
                    <Fab
                      variant={action.variant}
                      color={action.color}
                      onClick={action.onClick}
                      size={action.size}
                    >
                      <Icon>
                        <Iconify icon={action.icon} />
                      </Icon>
                    </Fab>
                  </Tooltip>
                ))}
              </div>
              <div>
                <Tooltip title="chat" placement="top">
                  <IconButton onClick={() => toggleChatDrawer?.()}>
                    <Badge
                      variant="dot"
                      color="info"
                      invisible={!hasUnreadMessages}
                    >
                      <Icon>
                        <Iconify
                          icon="carbon:chat"
                          color={ThemeConfig.palette.common.white}
                        />
                      </Icon>
                    </Badge>
                  </IconButton>
                </Tooltip>
              </div>
            </footer>
          )}

          {isMobile && (
            <>
              <BottomNavigation className="bg-[#000000] fixed w-full bottom-0 z-50">
                <div className="flex gap-2 justify-between w-full px-3 py-6 items-center">
                  <div className="flex gap-2">
                    {mainActions
                      .filter((action) => action.isMobile)
                      ?.map((action: MainActionProps, i: number) => (
                        <Tooltip key={i} title={action.title}>
                          <Fab
                            variant={action.variant}
                            color={action.color}
                            onClick={action.onClick}
                            size={"small"}
                          >
                            <Icon>
                              <Iconify icon={action.icon} />
                            </Icon>
                          </Fab>
                        </Tooltip>
                      ))}
                  </div>
                  <div>
                    <Tooltip title="chat" placement="top">
                      <IconButton onClick={() => toggleChatDrawer?.()}>
                        <Badge
                          variant="dot"
                          color="info"
                          invisible={!hasUnreadMessages}
                        >
                          <Icon>
                            <Iconify
                              icon="carbon:chat"
                              color={ThemeConfig.palette.common.white}
                            />
                          </Icon>
                        </Badge>
                      </IconButton>
                    </Tooltip>
                  </div>
                </div>
              </BottomNavigation>
            </>
          )}
        </div>
      </div>

      <ChatDrawer
        messages={messages}
        updateMessages={updateMessages}
        onClose={toggleOpenChatDrawer}
        open={isChatDrawer}
        title="Messages"
        setPeers={setPeers}
        peersRef={peersRef}
      />
    </>
  );
}

import { Fab, Icon, Tooltip, Typography } from "@mui/material";
import React, { useMemo } from "react";
import { Icon as Iconify } from "@iconify/react";
import { format } from "date-fns";
import { FormikProps } from "formik";

import VideoPreviewer from "common/VideoPreviewer";
import "./VideoMeet.css";
import ThemeConfig from "configs/ThemeConfig";
import { PeersType } from "./VideoMeetType";

interface VideoMeetProps {
  toggleCamera: () => void;
  toggleAudio: () => void;
  hangUp: () => void;
  raiseHand: () => void;
  mic: boolean;
  camera: boolean;
  hand: boolean;
  localMediaStream: MediaStream | undefined;
  peers: PeersType[];
  formik: FormikProps<{
    name: string;
    gender: string;
    meetId: string | undefined;
  }>;
  getAvatarQuery: any;
  onInputName: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface MainActionProps {
  title: string;
  variant: "circular" | "extended" | "opaque";
  color: "error" | "primary";
  onClick: () => void;
  size: "small" | "medium" | "large";
  icon: string;
}

export default function VideoMeet({
  toggleCamera,
  toggleAudio,
  raiseHand,
  hangUp,
  mic,
  camera,
  hand,
  localMediaStream,
  peers,
  formik,
  getAvatarQuery,
  onInputName,
}: VideoMeetProps) {
  const mainActions: MainActionProps[] = useMemo(
    () => [
      {
        title: "on/off microphone",
        variant: "opaque",
        color: `${mic ? "primary" : "error"}`,
        onClick: toggleAudio,
        size: "small",
        icon: `${mic ? "carbon:microphone" : "carbon:microphone-off"}`,
      },
      {
        title: "on/off camera",
        variant: "opaque",
        color: `${camera ? "primary" : "error"}`,
        onClick: toggleCamera,
        size: "small",
        icon: `${camera ? "bi:camera-video" : "bi:camera-video-off"}`,
      },
      {
        title: "Raise Hand",
        variant: "opaque",
        color: "primary",
        onClick: raiseHand,
        size: "small",
        icon: "emojione-monotone:hand-with-fingers-splayed",
      },
      {
        title: "End Call",
        variant: "opaque",
        color: "error",
        onClick: hangUp,
        size: "small",
        icon: "bi-telephone",
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
    [camera, mic]
  );

  return (
    <div className="bg-[#000000] overflow-y-hidden h-screen max-h-screen min-h-[500px]">
      <main className="overflow-y-scroll">
        <div className="h-[calc(100vh-80px)] pt-5 px-3">
          <div>
            {peers.length >= 1 ? (
              <div className="layout-grid-auto">
                <VideoPreviewer
                  camera={camera}
                  mic={mic}
                  muted={true}
                  active={true}
                  name={formik.values.name}
                  avatar={getAvatarQuery.data.data}
                  srcObject={localMediaStream}
                  header={
                    <div>
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
                      <Typography
                        className="vids-preview-title"
                        color={"white"}
                        variant="subtitle2"
                        suppressContentEditableWarning={true}
                        contentEditable={true}
                        onInput={onInputName}
                      >
                        {formik.values.name}
                      </Typography>{" "}
                    </div>
                  }
                />
                {peers?.map((peer: PeersType, index: number) => (
                  <VideoPreviewer
                    key={index}
                    camera={peer.userObj.peer_video}
                    mic={peer.userObj.peer_audio}
                    muted={true}
                    active={false}
                    avatar={peer.userObj.avatar}
                    peer={peer.peerObj}
                    name={peer.userObj.peer_name}
                    header={
                      <div>
                        <Icon
                          style={{
                            color: `${ThemeConfig.palette.common.white}`,
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
                className="h-[calc(100vh-100px)]"
                camera={camera}
                mic={mic}
                muted={true}
                active={true}
                name={formik.values.name}
                avatar={getAvatarQuery.data.data}
                srcObject={localMediaStream}
                header={
                  <div>
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
                    <Typography
                      className="vids-preview-title"
                      color={"white"}
                      variant="subtitle2"
                      contentEditable="true"
                      suppressContentEditableWarning={true}
                      onInput={onInputName}
                    >
                      {formik.values.name}
                    </Typography>
                  </div>
                }
              />
            )}
          </div>
        </div>
      </main>

      <footer className="flex justify-between gap-2 items-center my-3 mx-3">
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
        <div></div>
      </footer>
    </div>
  );
}

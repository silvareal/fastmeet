import {
  Fab,
  Icon,
  InputBase,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { KeyboardEvent, useMemo, useState } from "react";
import { Icon as Iconify } from "@iconify/react";
import { format } from "date-fns";
import { FormikProps } from "formik";

import VideoPreviewer from "common/VideoPreviewer";
import "./VideoMeet.css";
import ThemeConfig from "configs/ThemeConfig";
import { PeersType } from "./VideoMeetType";

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
  formik,
  getAvatarQuery,
  onInputName,
}: VideoMeetProps) {
  const mainActions: MainActionProps[] = useMemo(
    () => [
      {
        title: `${mic ? "Off Mic" : "On Mic"}`,
        variant: "opaque",
        color: `${mic ? "primary" : "error"}`,
        onClick: toggleAudio,
        size: "small",
        icon: `${mic ? "carbon:microphone" : "carbon:microphone-off"}`,
      },
      {
        title: `${camera ? "Off Camera" : "On Camera"}`,
        variant: "opaque",
        color: `${camera ? "primary" : "error"}`,
        onClick: toggleCamera,
        size: "small",
        icon: `${camera ? "bi:camera-video" : "bi:camera-video-off"}`,
      },
      {
        title: `${hand ? "End Raise Hand" : "Raise Hand"}`,
        variant: "opaque",
        color: "primary",
        onClick: raiseHand,
        size: "small",
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

  return (
    <div className="bg-[#000000] overflow-y-hidden h-screen max-h-screen min-h-[500px]">
      <main className="overflow-y-scroll">
        <div className="h-[calc(100vh-80px)] pt-5 px-3">
          {peers.length >= 1 ? (
            <div className="layout-grid-auto h-full">
              <VideoPreviewer
                camera={camera}
                mic={mic}
                muted={false}
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
                  muted={false}
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
              muted={false}
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

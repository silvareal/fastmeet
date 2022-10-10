import { Fab, Icon, Tooltip, Typography } from "@mui/material";
import React from "react";
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
  mic: boolean;
  camera: boolean;
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

export default function VideoMeet({
  toggleCamera,
  toggleAudio,
  hangUp,
  mic,
  camera,
  localMediaStream,
  peers,
  formik,
  getAvatarQuery,
  onInputName,
}: VideoMeetProps) {
  console.log("peers", peers);

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
                            mic ? "carbon:microphone" : "carbon:microphone-off"
                          }`}
                        />
                      </Icon>
                    </div>
                  }
                  footer={
                    <div>
                      <Typography
                        className="vids-preview-title"
                        color={"white"}
                        variant="subtitle2"
                        suppressContentEditableWarning={true}
                        contentEditable={true}
                        onInput={onInputName}
                      >
                        {formik.values.name}
                      </Typography>
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
                    name={peer.userObj.peer_name || ""}
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
                                ? "carbon:microphone"
                                : "carbon:microphone-off"
                            }`}
                          />
                        </Icon>
                      </div>
                    }
                    footer={
                      <div>
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
                          mic ? "carbon:microphone" : "carbon:microphone-off"
                        }`}
                      />
                    </Icon>
                  </div>
                }
                footer={
                  <div>
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
          <Tooltip title="on/off microphone">
            <Fab
              variant="opaque"
              color={`${mic ? "primary" : "error"}`}
              onClick={toggleAudio}
              size="medium"
            >
              <Icon>
                <Iconify
                  icon={`${
                    mic ? "carbon:microphone" : "carbon:microphone-off"
                  }`}
                />
              </Icon>
            </Fab>
          </Tooltip>
          <Tooltip title="on/off camera">
            <Fab
              variant="opaque"
              color={`${camera ? "primary" : "error"}`}
              onClick={toggleCamera}
              size="medium"
            >
              <Icon>
                <Iconify
                  icon={`${camera ? "bi:camera-video" : "bi:camera-video-off"}`}
                />
              </Icon>
            </Fab>
          </Tooltip>
          <Tooltip title="End Call">
            <Fab
              variant="opaque"
              color={"error"}
              onClick={hangUp}
              size="medium"
            >
              <Icon>
                <Iconify icon="bi-telephone" />
              </Icon>
            </Fab>
          </Tooltip>
          {/* <Tooltip title="layout">
            <Fab variant="opaque">
              <Icon>
                <Iconify icon="tabler:layout-grid" />
              </Icon>
            </Fab>
          </Tooltip> */}
        </div>
        <div></div>
      </footer>
    </div>
  );
}

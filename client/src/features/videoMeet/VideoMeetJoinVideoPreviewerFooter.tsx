import { Fab, Icon } from "@mui/material";
import React from "react";
import { Icon as Iconify } from "@iconify/react";

type Props = {
  toggleCamera: () => void;
  toggleAudio: () => void;
  mic: boolean;
  camera: boolean;
};

export default function VideoMeetJoinVideoPreviewerFooter({
  toggleCamera,
  toggleAudio,
  mic,
  camera,
}: Props) {
  return (
    <div className="flex justify-center gap-2">
      <Fab
        variant="opaque"
        color={`${mic ? "primary" : "error"}`}
        onClick={toggleAudio}
      >
        <Icon>
          <Iconify
            icon={`${mic ? "carbon:microphone" : "carbon:microphone-off"}`}
          />
        </Icon>
      </Fab>

      <Fab
        variant="opaque"
        color={`${camera ? "primary" : "error"}`}
        onClick={toggleCamera}
      >
        <Icon>
          <Iconify
            icon={`${camera ? "bi:camera-video" : "bi:camera-video-off"}`}
          />
        </Icon>
      </Fab>
    </div>
  );
}

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";

export default function VideoMeetSettingsActionModal({
  open,
  handleClose,
  localMediaStream,
}: {
  open: boolean;
  handleClose: () => void;
  localMediaStream: MediaStream | undefined;
}) {
  const [audioInputSelect, setAudioInputSelect] = useState<
    { label: string; kind: string; id: string }[]
  >([]);
  const [audioOutputSelect, setAudioOutputSelect] = useState<
    { label: string; kind: string; id: string }[]
  >([]);
  const [videoSelect, setVideoSelect] = useState<
    { label: string; kind: string; id: string }[]
  >([]);

  function gotDevices(deviceInfos: MediaDeviceInfo[]) {
    deviceInfos.forEach((deviceInfo: MediaDeviceInfo) => {
      if (deviceInfo.kind === "audioinput") {
        setAudioInputSelect([
          ...audioInputSelect,
          {
            label: deviceInfo.label,
            kind: deviceInfo.kind,
            id: deviceInfo.deviceId,
          },
        ]);
      } else if (deviceInfo.kind === "audiooutput") {
        setAudioOutputSelect([
          ...audioOutputSelect,
          {
            label: deviceInfo.label,
            kind: deviceInfo.kind,
            id: deviceInfo.deviceId,
          },
        ]);
      } else if (deviceInfo.kind === "videoinput") {
        setVideoSelect([
          ...videoSelect,
          {
            label: deviceInfo.label,
            kind: deviceInfo.kind,
            id: deviceInfo.deviceId,
          },
        ]);
      } else {
        console.log("Some other kind of source/device: ", deviceInfo);
      }
    });
  }

  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      console.log("enumerateDevices() not supported.");
    } else {
      navigator.mediaDevices
        .enumerateDevices()
        .then(gotDevices)
        .catch((error) =>
          console.log(
            "navigator.MediaDevices.getUserMedia error: ",
            error.message,
            error.name
          )
        );
    }
    // eslint-disable-next-line
  }, []);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="video-meet-settings-action-modal"
      aria-describedby="video-meet-settings-action-modal"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <TextField label="Audio Input" className="mb-3 mt-2" fullWidth select>
          {audioInputSelect.map((audioInput, i) => (
            <MenuItem key={i} value={audioInput.id}>
              {audioInput.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField label="Audio Output" className="mb-3" fullWidth select>
          {audioOutputSelect.map((audioOutput, i) => (
            <MenuItem key={i} value={audioOutput.id}>
              {audioOutput.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField label="Video Cam" className="mb-3" fullWidth select>
          {videoSelect.map((videoInput, i) => (
            <MenuItem key={i} value={videoInput.id}>
              {videoInput.label}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}

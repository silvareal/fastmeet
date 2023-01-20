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

type MediaInputType = { label: string; kind: string; id: string };
export default function VideoMeetSettingsActionModal({
  open,
  handleClose,
  localMediaStream,
}: {
  open: boolean;
  handleClose: () => void;
  localMediaStream: MediaStream | undefined;
}) {
  const [audioInputSelect, setAudioInputSelect] = useState<MediaInputType[]>(
    []
  );
  const [audioOutputSelect, setAudioOutputSelect] = useState<MediaInputType[]>(
    []
  );
  const [videoSelect, setVideoSelect] = useState<MediaInputType[]>([]);

  const addUpdateDevice = (
    prev: MediaInputType[],
    deviceInfo: MediaDeviceInfo
  ) => {
    const newDeviceInfo = [...prev];
    const deviceIndex = newDeviceInfo.findIndex(
      (device) => device.id === deviceInfo.deviceId
    );
    if (deviceIndex >= 0) {
      newDeviceInfo[deviceIndex] = {
        label: deviceInfo.label,
        kind: deviceInfo.kind,
        id: deviceInfo.deviceId,
      };
    } else {
      newDeviceInfo.push({
        label: deviceInfo.label,
        kind: deviceInfo.kind,
        id: deviceInfo.deviceId,
      });
    }
    return newDeviceInfo;
  };

  function gotDevices(deviceInfos: MediaDeviceInfo[]) {
    deviceInfos.forEach((deviceInfo: MediaDeviceInfo) => {
      switch (deviceInfo.kind) {
        case "audioinput":
          setAudioInputSelect((prev) => {
            return addUpdateDevice(prev, deviceInfo);
          });
          break;
        case "audiooutput":
          setAudioOutputSelect((prev) => {
            return addUpdateDevice(prev, deviceInfo);
          });
          break;
        case "videoinput":
          setVideoSelect((prev) => {
            return addUpdateDevice(prev, deviceInfo);
          });
          break;
        default:
          console.log("Some other kind of source/device: ", deviceInfo);
          break;
      }
    });
  }

  useEffect(() => {
    navigator?.mediaDevices
      ?.enumerateDevices()
      .then(gotDevices)
      .catch((error) =>
        console.log(
          "navigator.MediaDevices.getUserMedia error: ",
          error.message,
          error.name
        )
      );

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

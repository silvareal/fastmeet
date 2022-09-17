import {
  Button,
  Container,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import AppHeader from "AppHeader";
import VideoPreviewer from "common/VideoPreviewer";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";

export default function VideoMeetJoin() {
  const [camera, setCamera] = useState(false);
  const [mic, setMic] = useState(false);
  const [iceServers, setIceServers] = useState();
  const [peers, setPeers] = useState<any>([]);
  const [localMediaStream, setLocalMediaStream] = useState<MediaStream>();
  const [openParticipant, setOpenParticipant] = useState<boolean>(false);

  const [value, setValue] = React.useState("female");

  const handleChange = (event: any) => {
    setValue(event.target.value);
  };

  function initEnumerateDevices() {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalMediaStream(stream);
        setCamera(true);
        setMic(true);
      })
      .catch((err) => {
        console.log("err", err);
        setCamera(false);
        setMic(false);

        /* handle the error */
        if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          //required track is missing
        } else if (
          err.name === "NotReadableError" ||
          err.name === "TrackStartError"
        ) {
          //webcam or mic are already in use
        } else if (
          err.name === "OverconstrainedError" ||
          err.name === "ConstraintNotSatisfiedError"
        ) {
          //constraints can not be satisfied by avb. devices
        } else if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          //permission denied in browser
        } else if (err.name === "TypeError" || err.name === "TypeError") {
          //empty constraints object
        } else {
          //other errors
        }
      });
  }

  useEffect(() => {
    initEnumerateDevices();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <AppHeader />
      <Container maxWidth="xl" className="flex min-h-screen items-center">
        <div className="grid grid-cols-3 gap-10 w-full">
          <div className="flex flex-col  items-center w-full justify-around h-full">
            <div className="w-full">
              <TextField label="Name" placeholder="Sylvernus Akubo" fullWidth />
              <RadioGroup
                aria-label="gender"
                row
                name="gender"
                value={value}
                onChange={handleChange}
                className="flex justify-center"
              >
                <FormControlLabel
                  value="female"
                  control={<Radio />}
                  label="Female"
                />
                <FormControlLabel
                  value="male"
                  control={<Radio />}
                  label="Male"
                />
              </RadioGroup>
            </div>

            <Button size="large" fullWidth className="mt-10">
              Join Meeting
            </Button>
          </div>

          <div className="col-span-2 h-[450px]">
            <VideoPreviewer
              camera={camera}
              mic={mic}
              muted={true}
              active={true}
              srcObject={localMediaStream}
              header={
                <>
                  <Button>header</Button>
                </>
              }
              footer={
                <>
                  <Button>footer</Button>
                </>
              }
            />
          </div>
        </div>
      </Container>
    </div>
  );
}

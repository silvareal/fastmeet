import { io } from "socket.io-client";
/**
 * Get random number
 * @param {integer} length of string
 * @returns {string} random characters
 */
export function getRandomCharacters(length: number): string {
  let result: string = "";
  let characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function initEnumerateDevices(
  setStreamError: Function,
  success: (stream: MediaStream) => void,
  err: (err: any) => void
) {
  navigator.mediaDevices
    ?.getUserMedia({
      audio: true,
      video: true,
    })
    .then((stream: MediaStream) => {
      success(stream);
    })
    .catch((err) => {
      console.error("err", err);

      err(err);

      /* handle the error */
      if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        // Required track is missing
        setStreamError("Track Not Found");
      } else if (
        err.name === "NotReadableError" ||
        err.name === "TrackStartError"
      ) {
        //webcam or mic are already in use
        setStreamError("webcam or mic are already in use");
      } else if (
        err.name === "OverconstrainedError" ||
        err.name === "ConstraintNotSatisfiedError"
      ) {
        //constraints can not be satisfied by avb. devices
        setStreamError("constraints can not be satisfied by avb. devices");
      } else if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        //permission denied in browser
        setStreamError("permission denied in browser");
      } else if (err.name === "TypeError" || err.name === "TypeError") {
        //empty constraints object
        setStreamError("empty constraints object");
      } else {
        //other errors
        setStreamError(err.name);
      }
    });
}

export const BASE_URL: string =
  process.env.NODE_ENV === "development"
    ? `${window.location.protocol}//${window.location.hostname}:9000`
    : `${window.location.protocol}//${window.location.hostname}`;
console.log("BASE_URL", BASE_URL);
export const socket = io(`${BASE_URL}/video`, { forceNew: false });

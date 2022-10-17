import React from "react";

/**
 * PlaySound from server
 * @param {string} name
 * @returns HTMLAudioElement
 */
export default function usePlaySound(
  name:
    | "addPeer"
    | "alert"
    | "chatMessage"
    | "delete"
    | "download"
    | "eject"
    | "locked"
    | "newMessage"
    | "off"
    | "ok"
    | "on"
    | "raiseHand"
    | "recStart"
    | "recStop"
    | "removePeer"
    | "snapShot"
    | "speech"
    | "onlyParticipant"
): HTMLAudioElement {
  const [audio] = React.useState<HTMLAudioElement>(
    new Audio(`${process.env.REACT_APP_BASE_URL}/sounds/${name}.mp3`)
  );

  return audio;
}

import React from "react";

/**
 * PlaySound
 * @param name
 * @returns
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
): HTMLAudioElement {
  const audio = new Audio(`assets/sounds/${name}.mp4`);
  return audio;
}

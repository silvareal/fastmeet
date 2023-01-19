import DetectRTC from "detectrtc";
import Peer from "simple-peer";
import { Socket } from "socket.io-client";

/**
 * Toggle Audio on/off
 * @param {MediaStream} localMediaStream media stream
 * @param {Function} setter setter hooks setState
 * @param {Function} callback callback function
 */
export const toggleAudio = (
  localMediaStream: MediaStream | undefined,
  setter: (e: boolean) => void,
  callback?: (camera: boolean) => void
) => {
  // https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/getAudioTracks
  if (localMediaStream !== undefined) {
    localMediaStream.getAudioTracks()[0].enabled =
      !localMediaStream.getAudioTracks()[0].enabled;
    setter(localMediaStream.getAudioTracks()[0].enabled);
    callback !== undefined &&
      callback(localMediaStream.getAudioTracks()[0].enabled);
  }
};

/**
 * Toggle video on/off
 * @param {MediaStream} localMediaStream media stream
 * @param {Function} setter setter hooks setState
 * @param {Function} callback callback function
 */
export const toggleCamera = (
  localMediaStream: MediaStream | undefined,
  setter: (e: boolean) => void,
  callback?: (camera: boolean) => void
) => {
  // https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/getVideoTracks
  if (localMediaStream !== undefined) {
    localMediaStream.getVideoTracks()[0].enabled =
      !localMediaStream.getVideoTracks()[0].enabled;
    setter(localMediaStream.getVideoTracks()[0].enabled);
    callback !== undefined &&
      callback(localMediaStream.getVideoTracks()[0].enabled);
  }
};

/**
 *
 * @param {MediaStream | undefined} localMediaStream media stream
 */
export function hangUp(localMediaStream: MediaStream | undefined) {
  if (localMediaStream !== undefined) {
    localMediaStream.getVideoTracks()[0].enabled = false;
  }
}

/**
 * Get peer info using DetecRTC
 * https://github.com/muaz-khan/DetectRTC
 * @returns {object} peer info
 */
export function getPeerInfo() {
  return {
    detectRTCversion: DetectRTC.version,
    isWebRTCSupported: DetectRTC.isWebRTCSupported,
    // isDesktopDevice: !DetectRTC.isMobileDevice && !isTabletDevice && !isIPadDevice,
    isMobileDevice: DetectRTC.isMobileDevice,
    osName: DetectRTC.osName,
    osVersion: DetectRTC.osVersion,
    browserName: DetectRTC.browser.name,
    browserVersion: DetectRTC.browser.version,
  };
}

/**
 * Create Peer
 * @param {string} userToSignal
 * @param {string} callerId
 * @param {MediaStream} stream
 * @param {object} iceServers
 * @param socket
 * @returns peer
 */
export function createPeer(
  userToSignal: string,
  callerId: string,
  stream: MediaStream,
  iceServers: RTCIceServer[],
  socket: Socket
) {
  const peer = new Peer({
    initiator: true,
    trickle: false,
    stream,
    config: {
      iceServers: iceServers,
    },
  });

  console.log("peer", peer);

  peer.on("signal", (signal) => {
    socket.emit("initiate-signal", {
      userToSignal,
      callerId,
      signal,
    });
  });

  return peer;
}

/**
 * Add peer peer to signal
 * @param {string} incomingSignal
 * @param {string} callerId
 * @param {MediaStream} stream
 * @param {object} iceServers
 * @param {Socket} socket
 * @returns peer
 */
export function addPeerSignal(
  incomingSignal: string,
  callerId: string,
  stream: MediaStream,
  iceServers: RTCIceServer[],
  socket: Socket
) {
  const peer = new Peer({
    initiator: false,
    trickle: false,
    stream,
    config: {
      iceServers: iceServers,
    },
  });

  peer.on("signal", (signal) => {
    // Aknowledge signal and accept offer
    socket.emit("acknowledge-signal", { signal, callerId });
  });

  peer.signal(incomingSignal);

  return peer;
}

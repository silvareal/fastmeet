import DetectRTC from "detectrtc";

/**
 * Toggle Audio on/off
 * @param {MediaStream} localMediaStream
 * @param {function} setter
 * @param {function} callback
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
 * @param {MediaStream} localMediaStream
 * @param {function} setter
 * @param {function} callback
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

// Hanging up the call
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

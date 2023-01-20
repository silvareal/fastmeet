/**
 * A caller function to callback other function with args
 * @param {Function} callBack
 * @param {rest} args
 */
export function callerFn<T>(callBack: (args: T) => void, args: T) {
  callBack(args);
}

/**
 * Generate pronoun from gender
 * @param {"male" | "female"} gender
 * @returns
 */
export function genderToPronoun(gender: "male" | "female") {
  switch (gender) {
    case "male":
      return "His";
    case "female":
      return "Her";
  }
  return;
}

/**
 * Get MediaRecorder MimeTypes
 * @returns {boolean} is mimeType supported by media recorder
 */
export function getSupportedMimeTypes() {
  const possibleTypes = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=h264,opus",
    "video/mp4;codecs=h264,aac",
    "video/mp4",
  ];
  return possibleTypes.filter((mimeType) => {
    return MediaRecorder.isTypeSupported(mimeType);
  });
}

/**
 * Date Format: https://convertio.co/it/
 * @returns {string} date string format: DD-MM-YYYY-H_M_S
 */
export function getDataTimeString() {
  const d = new Date();
  const date = d.toISOString().split("T")[0];
  const time = d.toTimeString().split(" ")[0];
  return `${date}-${time}`;
}

/**
 * Convert bytes to KB-MB-GB-TB
 * @param {object} bytes to convert
 * @returns {string} converted size
 */
// export function bytesToSize(bytes: number) {
//   let sizes = ["Bytes", "KB", "MB", "GB", "TB"];
//   if (bytes == 0) return "0 Byte";
//   let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
//   return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
// }

/**
 * Save to PC / Mobile devices
 * https://developer.mozilla.org/en-US/docs/Web/API/Blob
 * @param {object} blob content
 * @param {string} file to save
 */
export function saveBlobToFile(blob: Blob, file: any) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = file;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}

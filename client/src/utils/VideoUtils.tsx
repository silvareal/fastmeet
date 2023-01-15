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

export const BASE_URL: string =
  process.env.NODE_ENV === "development"
    ? `${window.location.protocol}//${window.location.hostname}:9000`
    : `${window.location.protocol}//${window.location.hostname}`;
console.log("BASE_URL", BASE_URL);
export const socket = io(`${BASE_URL}/video`, { forceNew: false });

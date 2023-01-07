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

export const baseUrl: string = process.env.REACT_APP_BASE_URL || "";
export const socket = io(`${baseUrl}/video`, { forceNew: false });

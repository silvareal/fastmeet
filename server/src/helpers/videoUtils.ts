import path from "path";
import { readdir } from "node:fs/promises";
import { ClientType } from "../helpers/VideoTypes";
import { EventEmitter } from "stream";
import { Socket } from "socket.io";

/**
 *
 * @param category "male" | "female"
 * @returns Promise
 */
export async function getRandomMemojiImage(category: "male" | "female") {
  const imageDir = path.resolve(__dirname, `../../public/images/${category}`);
  let randomImage;
  try {
    const files = await readdir(imageDir);
    randomImage = `images/${category}/${
      files[Math.floor(Math.random() * files.length)]
    }`;
    console.log("random image generated", randomImage);
    return randomImage;
  } catch (err) {
    console.error(err);
  }
  return "";
}

/**
 * Send async data to all peers in the same room except yourself
 * @param {string} room_id id of the room to send data
 * @param {string} socket_id socket id of peer that send data
 * @param {ClientType} channels channels
 * @param {string} msg message to send to the peers in the same room
 * @param {object} config data to send to the peers in the same room
 */
export async function sendToRoom(
  socket: Socket,
  room_id: string,
  socket_id: string,
  channels: ClientType,
  msg: string,
  config = {}
) {
  for (const peer_id in channels[room_id]) {
    // not send data to myself
    if (peer_id != socket_id) {
      await socket.to(channels[room_id][peer_id].socketId).emit(msg, config);
    }
  }
}

/**
 * Send async data to specified peer
 * @param {string} peer_id id of the peer to send data
 * @param {object} sockets all peers connections
 * @param {string} msg message to send to the peer in the same room
 * @param {object} config data to send to the peer in the same room
 */
export async function sendToPeer(
  peer_id: string,
  sockets: any,
  msg: string,
  config = {}
) {
  if (peer_id in sockets) {
    await sockets[peer_id].emit(msg, config);
    //console.log('Send to peer', { msg: msg, config: config });
  }
}

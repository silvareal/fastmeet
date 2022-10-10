import { Socket } from "socket.io";

import Logger from "../helpers/GlobalUtils";
import { sendToRoom } from "../helpers/videoUtils";
import {
  ClientDetailsType,
  ClientType,
  SocketRoomMapType,
} from "../helpers/VideoTypes";

const log = new Logger();

interface PeerActionConfig extends Partial<ClientDetailsType> {
  room_id: string;
  send_to_all: boolean;
}

export function video(io: any) {
  const clients: ClientType = {};
  const socketRoomMap: SocketRoomMapType = {};

  const videoNamespace = io.of("/video");
  // room object to store the created room IDs
  videoNamespace.on("connection", (socket: Socket) => {
    socket.on(
      "join",
      async (roomId: string, clientDetails: ClientDetailsType) => {
        try {
          // Add client to room
          console.log(clientDetails.peer_name + " - joined room: " + roomId);

          // adding map clients to room
          if (clients[roomId]) {
            clients[roomId].push({ socketId: socket.id, ...clientDetails });
          } else {
            clients[roomId] = [{ socketId: socket.id, ...clientDetails }];
          }

          // adding map of socketid to room
          socketRoomMap[socket.id] = roomId;

          const clientsInRoom = clients[roomId].filter(
            (client) => client.socketId !== socket.id
          );

          // console.log("All clients in room: ", clientsInRoom);
          // console.log("clients", clients);

          // once a new client has joined sending the details of clients who are already present in room.
          socket.emit("clients-in-room", clientsInRoom);
        } catch (err) {
          console.log(err);
        }
      }
    );

    socket.on("initiate-signal", (payload) => {
      const roomId = socketRoomMap[socket.id];
      const room = clients[roomId];
      let clientDetails;
      if (room) {
        const user = room.find((user) => user.socketId === socket.id);
        clientDetails = user;
      }

      console.log("clientDetails", clientDetails);

      // once a peer wants to initiate signal, To old user sending the user details along with signal
      videoNamespace.to(payload.userToSignal).emit("user-joined", {
        signal: payload.signal,
        callerId: payload.callerId,
        user: clientDetails,
      });
    });

    /**
     * Relay actions to peers or specific peer in the same room
     */
    socket.on("peerAction", async (config: PeerActionConfig) => {
      // log.debug('Peer action', config);
      const room_id = config.room_id;
      const peer_name = config.peer_name;
      const peer_audio = config.peer_audio;
      const peer_video = config.peer_video;

      const room = clients[room_id];
      const roomIndex: number = room.findIndex(
        (client) => client.socketId === socket.id
      );
      const clientItem = room[roomIndex];
      if (peer_name && peer_audio && peer_video) {
        clientItem.peer_name = peer_name;
        clientItem.peer_audio = peer_audio;
        clientItem.peer_video = peer_video;
      }
      console.log("clientItem", clientItem);

      log.debug<
        string,
        {
          peer_name: string;
          peer_audio: boolean;
          peer_video: boolean | undefined;
        }
      >("[" + socket.id + "] emit peerAction to [room_id: " + room_id + "]", {
        peer_name: peer_name || "",
        peer_audio: peer_audio || false,
        peer_video: peer_video || false,
      });

      await sendToRoom(socket, room_id, socket.id, clients, "peerAction", {
        room_id: room_id,
        socket_id: socket.id,
        peer_name: peer_name,
        peer_audio: peer_audio,
        peer_video: peer_video,
      });
    });

    // once the peer acknowledge signal sending the acknowledgement back so that it can stream peer to peer.
    socket.on("acknowledge-signal", (payload) => {
      videoNamespace.to(payload.callerId).emit("signal-accepted", {
        signal: payload.signal,
        id: socket.id,
      });
    });

    socket.on("disconnect", async () => {
      const roomId = socketRoomMap[socket.id];
      let room = clients[roomId];
      if (room) {
        room = room.filter((user) => user.socketId !== socket.id);
        clients[roomId] = room;
      }

      // emiting a signal and sending it to everyone that a user left
      await sendToRoom(socket, roomId, socket.id, clients, "userDisconnected", {
        socketId: socket.id,
      });
    });
  });
}

import { Socket } from "socket.io";

import { Logger } from "../helpers/GlobalUtils";
import { sendToRoom } from "../helpers/videoUtils";
import {
  ClientDetailsType,
  ClientType,
  SocketRoomMapType,
} from "../helpers/VideoTypes";

const log = new Logger();

interface PeerActionStatusConfig {
  room_id: string;
  element: "name" | "video" | "hand" | "audio" | "screen" | "rec";
  status: string | boolean;
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
    socket.on("peerActionStatus", async (config: PeerActionStatusConfig) => {
      const room_id = config.room_id;
      const element = config.element;
      const status = config.status;

      try {
        const room = clients[room_id];
        if (room?.length >= 1) {
          const roomIndex: number = room.findIndex(
            (client) => client.socketId === socket.id
          );
          const clientItem = room[roomIndex];

          if (clientItem) {
            switch (element) {
              case "video":
                clientItem.peer_video = status as boolean;
                break;
              case "audio":
                clientItem.peer_audio = status as boolean;
                break;
              case "screen":
                clientItem.peer_screen_share = status as boolean;
                break;
              case "hand":
                clientItem.peer_raised_hand = status as boolean;
                break;
              case "rec":
                clientItem.peer_screen_record = status as boolean;
                break;
              case "name":
                clientItem.peer_name = status as string;
                break;
            }
          }
        }

        log.debug<string, PeerActionStatusConfig>(
          "[" +
            socket.id +
            "] emit peerActionStatus to [room_id: " +
            room_id +
            "]",
          {
            room_id,
            element,
            status,
          }
        );

        await sendToRoom(
          socket,
          room_id,
          socket.id,
          clients,
          "peerActionStatus",
          {
            room_id: room_id,
            socket_id: socket.id,
            element,
            status,
          }
        );
      } catch (err) {
        log.error("Peer Status", err);
      }
    });

    /**
     * once the peer acknowledge signal sending the acknowledgement
     * back so that it can stream peer to peer.
     */
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

      log.info<string>(
        "[" + socket.id + "] disconnects from [room_id: " + roomId + "]"
      );

      // emiting a signal and sending it to everyone in the room that a user left
      await sendToRoom(socket, roomId, socket.id, clients, "userDisconnected", {
        socketId: socket.id,
      });
    });

    /**
     * Message to peers or specific peer in the same room
     */
    socket.on(
      "messageAction",
      async (config: { room_id: string; message: string }) => {
        const room_id = config.room_id;
        const message = config.message;

        try {
          log.debug<string, { room_id: string; message: string }>(
            "[" +
              socket.id +
              "] emit messageAction to [room_id: " +
              room_id +
              "]",
            {
              room_id,
              message,
            }
          );

          await sendToRoom(
            socket,
            room_id,
            socket.id,
            clients,
            "messageAction",
            {
              room_id: room_id,
              socket_id: socket.id,
              message,
            }
          );
        } catch (err) {
          log.error("message Peer", err);
        }
      }
    );
  });
}

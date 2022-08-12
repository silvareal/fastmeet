import { Socket } from "socket.io";

interface ClientDetailsType {
  socketId: string;
  [x: string]: string;
}

interface ClientType {
  [x: string]: ClientDetailsType[];
}

interface SocketRoomMapType {
  [x: string]: string;
}

export function video(io: any) {
  const clients: ClientType = {};
  const socketRoomMap: SocketRoomMapType = {};

  const videoNamespace = io.of("/video");
  // room object to store the created room IDs
  videoNamespace.on("connection", (socket: Socket) => {
    socket.on("join", async (roomId: string, clientDetails) => {
      try {
        // Add client to room
        console.log(clientDetails.name + " - joined room: " + roomId);

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

        console.log("All clients in room: ", clientsInRoom);

        // once a new client has joined sending the details of clients who are already present in room.
        socket.emit("clients-in-room", clientsInRoom);
      } catch (err) {
        console.log(err);
      }
    });

    socket.on(
      "initiate-signal",
      (payload: {
        signal: any;
        userToSignal: string;
        callerId: string;
        user: ClientDetailsType;
      }) => {
        const roomId = socketRoomMap[socket.id];
        const room = clients[roomId];
        let clientDetails: ClientDetailsType;
        if (room) {
          const user = room.find((user) => user.socketId === socket.id);
          if (user !== undefined) {
            clientDetails = user;

            // once a peer wants to initiate signal, To old user sending the user details along with signal
            videoNamespace.to(payload.userToSignal).emit("user-joined", {
              signal: payload.signal,
              callerId: payload.callerId,
              user: clientDetails,
            });
          }
        }
      }
    );

    // once the peer acknowledge signal sending the acknowledgement back so that it can stream peer to peer.
    socket.on(
      "acknowledge-signal",
      (payload: { signal: any; callerId: string; id: string }) => {
        videoNamespace.to(payload.callerId).emit("signal-accepted", {
          signal: payload.signal,
          id: socket.id,
        });
      }
    );

    socket.on("disconnect", () => {
      const roomId = socketRoomMap[socket.id];
      let room = clients[roomId];
      if (room) {
        room = room.filter((user) => user.socketId !== socket.id);
        clients[roomId] = room;
      }

      // emiting a signal and sending it to everyone that a user left
      socket.broadcast.emit("user-disconnected", socket.id);
    });
  });
}

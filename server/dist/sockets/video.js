"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.video = void 0;
function video(io) {
    const clients = {};
    const socketRoomMap = {};
    const videoNamespace = io.of("/video");
    // room object to store the created room IDs
    videoNamespace.on("connection", (socket) => {
        socket.on("join", (roomId, clientDetails) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Add client to room
                console.log(clientDetails.name + " - joined room: " + roomId);
                // adding map clients to room
                if (clients[roomId]) {
                    clients[roomId].push(Object.assign({ socketId: socket.id }, clientDetails));
                }
                else {
                    clients[roomId] = [Object.assign({ socketId: socket.id }, clientDetails)];
                }
                // adding map of socketid to room
                socketRoomMap[socket.id] = roomId;
                const clientsInRoom = clients[roomId].filter((client) => client.socketId !== socket.id);
                console.log("All clients in room: ", clientsInRoom);
                // once a new client has joined sending the details of clients who are already present in room.
                socket.emit("clients-in-room", clientsInRoom);
            }
            catch (err) {
                console.log(err);
            }
        }));
        socket.on("initiate-signal", (payload) => {
            const roomId = socketRoomMap[socket.id];
            const room = clients[roomId];
            let clientDetails;
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
        });
        // once the peer acknowledge signal sending the acknowledgement back so that it can stream peer to peer.
        socket.on("acknowledge-signal", (payload) => {
            videoNamespace.to(payload.callerId).emit("signal-accepted", {
                signal: payload.signal,
                id: socket.id,
            });
        });
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
exports.video = video;

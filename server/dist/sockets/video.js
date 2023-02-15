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
const GlobalUtils_1 = require("../helpers/GlobalUtils");
const videoUtils_1 = require("../helpers/videoUtils");
const log = new GlobalUtils_1.Logger();
function video(io) {
    const clients = {};
    const socketRoomMap = {};
    const videoNamespace = io.of("/video");
    // room object to store the created room IDs
    videoNamespace.on("connection", (socket) => {
        socket.on("join", (roomId, clientDetails) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Add client to room
                console.log(clientDetails.peer_name + " - joined room: " + roomId);
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
                // console.log("All clients in room: ", clientsInRoom);
                // console.log("clients", clients);
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
        socket.on("peerActionStatus", (config) => __awaiter(this, void 0, void 0, function* () {
            const room_id = config.room_id;
            const element = config.element;
            const status = config.status;
            try {
                const room = clients[room_id];
                if ((room === null || room === void 0 ? void 0 : room.length) >= 1) {
                    const roomIndex = room.findIndex((client) => client.socketId === socket.id);
                    const clientItem = room[roomIndex];
                    if (clientItem) {
                        switch (element) {
                            case "video":
                                clientItem.peer_video = status;
                                break;
                            case "audio":
                                clientItem.peer_audio = status;
                                break;
                            case "screen":
                                clientItem.peer_screen_share = status;
                                break;
                            case "hand":
                                clientItem.peer_raised_hand = status;
                                break;
                            case "rec":
                                clientItem.peer_screen_record = status;
                                break;
                            case "name":
                                clientItem.peer_name = status;
                                break;
                        }
                    }
                }
                log.debug("[" +
                    socket.id +
                    "] emit peerActionStatus to [room_id: " +
                    room_id +
                    "]", {
                    room_id,
                    element,
                    status,
                });
                yield (0, videoUtils_1.sendToRoom)(socket, room_id, socket.id, clients, "peerActionStatus", {
                    room_id: room_id,
                    socket_id: socket.id,
                    element,
                    status,
                });
            }
            catch (err) {
                log.error("Peer Status", err);
            }
        }));
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
        socket.on("disconnect", () => __awaiter(this, void 0, void 0, function* () {
            const roomId = socketRoomMap[socket.id];
            let room = clients[roomId];
            if (room) {
                room = room.filter((user) => user.socketId !== socket.id);
                clients[roomId] = room;
            }
            log.info("[" + socket.id + "] disconnects from [room_id: " + roomId + "]");
            // emiting a signal and sending it to everyone in the room that a user left
            yield (0, videoUtils_1.sendToRoom)(socket, roomId, socket.id, clients, "userDisconnected", {
                socketId: socket.id,
            });
        }));
        /**
         * Message to peers or specific peer in the same room
         */
        socket.on("messageAction", (config) => __awaiter(this, void 0, void 0, function* () {
            const room_id = config.room_id;
            const message = config.message;
            try {
                log.debug("[" +
                    socket.id +
                    "] emit messageAction to [room_id: " +
                    room_id +
                    "]", {
                    room_id,
                    message,
                });
                yield (0, videoUtils_1.sendToRoom)(socket, room_id, socket.id, clients, "messageAction", {
                    room_id: room_id,
                    socket_id: socket.id,
                    message,
                });
            }
            catch (err) {
                log.error("message Peer", err);
            }
        }));
    });
}
exports.video = video;

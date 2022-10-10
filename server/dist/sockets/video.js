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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.video = void 0;
const GlobalUtils_1 = __importDefault(require("../helpers/GlobalUtils"));
const videoUtils_1 = require("../helpers/videoUtils");
const log = new GlobalUtils_1.default();
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
        socket.on("peerAction", (config) => __awaiter(this, void 0, void 0, function* () {
            // log.debug('Peer action', config);
            const room_id = config.room_id;
            const peer_name = config.peer_name;
            const peer_audio = config.peer_audio;
            const peer_video = config.peer_video;
            const room = clients[room_id];
            const roomIndex = room.findIndex((client) => client.socketId === socket.id);
            const clientItem = room[roomIndex];
            if (peer_name && peer_audio && peer_video) {
                clientItem.peer_name = peer_name;
                clientItem.peer_audio = peer_audio;
                clientItem.peer_video = peer_video;
            }
            console.log("clientItem", clientItem);
            log.debug("[" + socket.id + "] emit peerAction to [room_id: " + room_id + "]", {
                peer_name: peer_name || "",
                peer_audio: peer_audio || false,
                peer_video: peer_video || false,
            });
            yield (0, videoUtils_1.sendToRoom)(socket, room_id, socket.id, clients, "peerAction", {
                room_id: room_id,
                socket_id: socket.id,
                peer_name: peer_name,
                peer_audio: peer_audio,
                peer_video: peer_video,
            });
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
    });
}
exports.video = video;

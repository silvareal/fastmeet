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
exports.sendToPeer = exports.sendToRoom = exports.hangUp = exports.toggleCamera = exports.toggleAudio = exports.getRandomMemojiImage = void 0;
const path_1 = __importDefault(require("path"));
const promises_1 = require("node:fs/promises");
/**
 *
 * @param category "male" | "female"
 * @returns Promise
 */
function getRandomMemojiImage(category) {
    return __awaiter(this, void 0, void 0, function* () {
        const imageDir = path_1.default.resolve(__dirname, `../../public/images/${category}`);
        let randomImage;
        try {
            const files = yield (0, promises_1.readdir)(imageDir);
            randomImage = `images/${category}/${files[Math.floor(Math.random() * files.length)]}`;
            console.log("random image generated", randomImage);
            return randomImage;
        }
        catch (err) {
            console.error(err);
        }
        return "";
    });
}
exports.getRandomMemojiImage = getRandomMemojiImage;
/**
 * Toggle Audio on/off
 * @param {MediaStream} localMediaStream media stream
 * @param {Function} setter setter hooks setState
 * @param {Function} callback callback function
 */
const toggleAudio = (localMediaStream, setter, callback) => {
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/getAudioTracks
    if (localMediaStream !== undefined) {
        localMediaStream.getAudioTracks()[0].enabled =
            !localMediaStream.getAudioTracks()[0].enabled;
        setter(localMediaStream.getAudioTracks()[0].enabled);
        callback !== undefined &&
            callback(localMediaStream.getAudioTracks()[0].enabled);
    }
};
exports.toggleAudio = toggleAudio;
/**
 * Toggle video on/off
 * @param {MediaStream} localMediaStream media stream
 * @param {Function} setter setter hooks setState
 * @param {Function} callback callback function
 */
const toggleCamera = (localMediaStream, setter) => {
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/getVideoTracks
    if (localMediaStream !== undefined) {
        localMediaStream.getVideoTracks()[0].enabled =
            !localMediaStream.getVideoTracks()[0].enabled;
        setter(localMediaStream.getVideoTracks()[0].enabled);
    }
};
exports.toggleCamera = toggleCamera;
/**
 *
 * @param {MediaStream | undefined} localMediaStream media stream
 */
function hangUp(localMediaStream) {
    if (localMediaStream !== undefined) {
        localMediaStream.getVideoTracks()[0].enabled = false;
    }
}
exports.hangUp = hangUp;
// /**
//  * Get peer info using DetecRTC
//  * https://github.com/muaz-khan/DetectRTC
//  * @returns {object} peer info
//  */
// export function getPeerInfo() {
//   return {
//     detectRTCversion: DetectRTC.version,
//     isWebRTCSupported: DetectRTC.isWebRTCSupported,
//     // isDesktopDevice: !DetectRTC.isMobileDevice && !isTabletDevice && !isIPadDevice,
//     isMobileDevice: DetectRTC.isMobileDevice,
//     osName: DetectRTC.osName,
//     osVersion: DetectRTC.osVersion,
//     browserName: DetectRTC.browser.name,
//     browserVersion: DetectRTC.browser.version,
//   };
// }
/**
 * Send async data to all peers in the same room except yourself
 * @param {string} room_id id of the room to send data
 * @param {string} socket_id socket id of peer that send data
 * @param {ClientType} channels channels
 * @param {string} msg message to send to the peers in the same room
 * @param {object} config data to send to the peers in the same room
 */
function sendToRoom(socket, room_id, socket_id, channels, msg, config = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const peer_id in channels[room_id]) {
            // not send data to myself
            if (peer_id != socket_id) {
                yield socket.to(channels[room_id][peer_id].socketId).emit(msg, config);
            }
        }
    });
}
exports.sendToRoom = sendToRoom;
/**
 * Send async data to specified peer
 * @param {string} peer_id id of the peer to send data
 * @param {object} sockets all peers connections
 * @param {string} msg message to send to the peer in the same room
 * @param {object} config data to send to the peer in the same room
 */
function sendToPeer(peer_id, sockets, msg, config = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        if (peer_id in sockets) {
            yield sockets[peer_id].emit(msg, config);
            //console.log('Send to peer', { msg: msg, config: config });
        }
    });
}
exports.sendToPeer = sendToPeer;

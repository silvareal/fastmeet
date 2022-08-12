"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const video_1 = require("../sockets/video");
function listen(io) {
    // video meet io namespace
    (0, video_1.video)(io);
}
exports.default = listen;

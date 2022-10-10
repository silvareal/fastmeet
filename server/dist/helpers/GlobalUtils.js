"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const colors_1 = __importDefault(require("colors"));
colors_1.default.enable(); //colors.disable();
const options = {
    depth: null,
    colors: true,
};
/**
 * Logger for logging errors, info and debug
 */
class Logger {
    constructor(appName = "FastMeetP2P", debugOn = true) {
        this.appName = colors_1.default.yellow(appName);
        this.debugOn = debugOn;
        this.timeStart = Date.now();
        this.timeEnd = null;
        this.timeElapsedMs = null;
    }
    debug(msg, op) {
        if (this.debugOn) {
            this.timeEnd = Date.now();
            this.timeElapsedMs = this.getFormatTime(Math.floor(this.timeEnd - this.timeStart));
            console.debug("[" + this.getDataTime() + "] [" + this.appName + "] " + msg, util_1.default.inspect(op, options), this.timeElapsedMs);
            this.timeStart = Date.now();
        }
    }
    log(msg, op) {
        console.log("[" + this.getDataTime() + "] [" + this.appName + "] " + msg, util_1.default.inspect(op, options));
    }
    info(msg, op) {
        console.info("[" +
            this.getDataTime() +
            "] [" +
            this.appName +
            "] " +
            colors_1.default.green(`${msg}`), util_1.default.inspect(op, options));
    }
    warn(msg, op) {
        console.warn("[" +
            this.getDataTime() +
            "] [" +
            this.appName +
            "] " +
            colors_1.default.yellow(`${msg}`), util_1.default.inspect(op, options));
    }
    error(msg, op) {
        console.error("[" +
            this.getDataTime() +
            "] [" +
            this.appName +
            "] " +
            colors_1.default.red(`${msg}`), util_1.default.inspect(op, options));
    }
    getDataTime() {
        return colors_1.default.cyan(new Date().toISOString().replace(/T/, " ").replace(/Z/, ""));
    }
    getFormatTime(ms) {
        let time = Math.floor(ms);
        let type = "ms";
        if (ms >= 1000) {
            time = Math.floor((ms / 1000) % 60);
            type = "s";
        }
        if (ms >= 60000) {
            time = Math.floor((ms / 1000 / 60) % 60);
            type = "m";
        }
        if (ms >= (3, 6e6)) {
            time = Math.floor((ms / 1000 / 60 / 60) % 24);
            type = "h";
        }
        return colors_1.default.magenta("+" + time + type);
    }
}
exports.default = Logger;

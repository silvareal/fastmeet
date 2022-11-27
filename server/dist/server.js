"use strict";
/*
http://patorjk.com/software/taag/#p=display&f=ANSI%20Regular&t=Server
 ____  __    ___  ____    __  __  ____  ____  ____
( ___)/__\  / __)(_  _)  (  \/  )( ___)( ___)(_  _)
 )__)/(__)\ \__ \  )(     )    (  )__)  )__)   )(
(__)(__)(__)(___/ (__)   (_/\/\_)(____)(____) (__)
                                
/**
 * Fast Meet- Server component
 *
 * @link    GitHub: https://github.com/silvareal/fastmeet.git
 * @link    Live demo: https://fastmeet.live
 * @license For open source use: AGPLv3
 * @license For commercial or closed source, akubosylvernus@gmail.com
 * @author  Sylvernus Akubo- akubosylvernus@gmail.com
 * @version 1.0.1
 *
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const dotenv = __importStar(require("dotenv")); // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
const sockets_1 = __importDefault(require("./sockets"));
const app_1 = __importDefault(require("./app"));
const PORT = process.env.SERVER_PORT || 9000;
const server = http_1.default.createServer(app_1.default);
const socketServer = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    }
});
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        server.listen(PORT, () => {
            console.log(`Listening on port ${PORT}...`);
        });
        (0, sockets_1.default)(socketServer);
    });
}
startServer();

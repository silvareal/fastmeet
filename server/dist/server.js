"use strict";
/*
http://patorjk.com/software/taag/#p=display&f=ANSI%20Regular&t=Server
 ____  __    ___  ____    __  __  ____  ____  ____
( ___)/__\  / __)(_  _)  (  \/  )( ___)( ___)(_  _)
 )__)/(__)\ \__ \  )(     )    (  )__)  )__)   )(
(__)(__)(__)(___/ (__)   (_/\/\_)(____)(____) (__)
                                
dependencies: {
    cors                    : https://www.npmjs.com/package/cors
    dotenv                  : https://www.npmjs.com/package/dotenv
    express                 : https://www.npmjs.com/package/express
    ngrok                   : https://www.npmjs.com/package/ngrok
    socket.io               : https://www.npmjs.com/package/socket.io
    swagger                 : https://www.npmjs.com/package/swagger-ui-express
    uuid                    : https://www.npmjs.com/package/uuid
    yamljs                  : https://www.npmjs.com/package/yamljs
}
*/
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
/**
 * Fast Meet- Server component
 *
 * @link    GitHub: https://github.com/silvareal/fastmeet.git
 * @link    Live demo: https://p2p.mirotalk.org or https://mirotalk.up.railway.app or https://mirotalk.herokuapp.com
 * @license For open source use: AGPLv3
 * @license For commercial or closed source, contact us at info.mirotalk@gmail.com
 * @author  Sylvernus Akubo- akubosylvernus5@gmail.com
 * @version 1.0.1
 *
 */
const http = require("http");
const io = require('socket.io');
require("dotenv").config();
const sockets_1 = __importDefault(require("./sockets"));
const app = require("./app");
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const socketServer = io(server, {
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

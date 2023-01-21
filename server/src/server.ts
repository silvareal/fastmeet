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


import http from "http"
import { Server } from "socket.io";
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

import sockets from "./sockets";
import app  from "./app"

const PORT = process.env.SERVER_PORT || 9000;

const server = http.createServer(app);
const socketServer = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
});

async function startServer() {
  server.listen(PORT, () => { 
    console.log(`Listening on port ${PORT}...`);
  });
  sockets(socketServer);
}

startServer();

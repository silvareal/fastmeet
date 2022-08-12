import { video } from "../sockets/video"

export default function listen(io: any) {
  // video meet io namespace
  video(io);

}
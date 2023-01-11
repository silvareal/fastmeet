import { PeersType } from "features/videoMeet/VideoMeetType";

export interface GlobalInitialStateType {
  camera: boolean;
  mic: boolean;
  handRaised: boolean;
  screenShare: boolean;
  localMediaStream?: MediaStream;
  peers?: PeersType[];
}

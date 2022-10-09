export interface UserObjType {
  socketId: string;
  userAgent: { [field: string]: string };
  channel_password: string;
  peer_info: { [field: string]: string };
  peer_name: string;
  peer_gender: string;
  avatar: string;
  peer_video: boolean;
  peer_audio: boolean;
}
export interface PeersType {
  peerId: string;
  peerObj: any;
  userObj: UserObjType;
}

export interface PeersRefType {
  peerId: string;
  peer: any;
}

export interface UserJoinedPayloadType {
  userToSignal: string;
  signal: any;
  callerId: any;
  user: UserObjType;
}

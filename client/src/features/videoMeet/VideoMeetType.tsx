export interface UserObjType {
  socketId: string;
  userAgent: { [field: string]: string };
  channel_password: string;
  peer_info: { [field: string]: string };
  peer_name: string;
  peer_gender: "male" | "female";
  avatar: string;
  peer_video: boolean;
  peer_audio: boolean;
  peer_raised_hand: boolean;
  peer_screen_record: boolean;
  peer_screen_share: boolean;
}
export interface PeersType {
  peerId: string;
  peerObj: any;
  userObj: UserObjType;
}

export interface PeersRefType {
  peerId: string;
  peerObj: any;
  userObj: UserObjType;
}

export interface UserJoinedPayloadType {
  userToSignal: string;
  signal: any;
  callerId: any;
  user: UserObjType;
}

export interface PeerActionStatusConfig {
  room_id: string;
  socket_id: string;
  element: "name" | "video" | "hand" | "audio" | "screen" | "rec";
  status: string | boolean;
}


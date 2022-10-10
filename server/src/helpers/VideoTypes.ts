export interface ClientDetailsType {
  userAgent: { [field: string]: string };
  channel_password: string;
  peer_info: { [field: string]: string };
  peer_name: string;
  peer_gender: string;
  avatar: string;
  peer_video: boolean;
  peer_audio: boolean;
}

export interface ClientDetailsSocketType extends ClientDetailsType {
  socketId: string;
}

export interface ClientType {
  [roomId: string]: ClientDetailsSocketType[];
}

export interface SocketRoomMapType {
  [x: string]: string;
}

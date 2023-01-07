export interface SenderDetailsType {
  userName: string;
  ID: string;
}
export interface MessageDetailsType {
  message: string;
  senderDetails: SenderDetailsType;
}

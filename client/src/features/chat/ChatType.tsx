export interface SenderDetailsType {
  userName?: string;
  ID?: string;
  isFromMe?: boolean;
}
export interface MessageDetailsType {
  message: string;
  senderDetails?: SenderDetailsType;
  isMessageRead?:boolean;
}

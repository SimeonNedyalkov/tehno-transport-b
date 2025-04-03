import { Timestamp } from 'firebase-admin/firestore';

export class CreateSmsLogDto {
  customerID: string;

  isSent: boolean;

  message: string;

  receiverName: string;

  response: string;

  senderName: string;

  sentAt?: Timestamp;
}

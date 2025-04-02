import { IsDate } from 'class-validator';
import { Timestamp } from 'firebase/firestore';

export class CreateCustomerDto {
  id: string;
  brand: string;
  firstName: string;
  model: string;
  phone: number;
  regNumber: string;
  isSmsSent: boolean;
  createdAt?: Timestamp;

  @IsDate()
  dateOfLastTehnoTest: Timestamp | Date;

  @IsDate()
  dateOfNextTehnoTest?: Timestamp | Date;
}

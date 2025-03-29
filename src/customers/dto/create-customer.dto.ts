import { IsDate } from 'class-validator';
import { Timestamp } from 'firebase/firestore';

export class CreateCustomerDto {
  id: string;
  brand: string;
  firstName: string;
  model: string;
  phone: number;
  regNumber: string;

  createdAt?: Timestamp;

  @IsDate()
  dateOfTehnoTest: Date | Timestamp | { seconds: number; nanoseconds: number };
  // daysRemaining?: number;
  // status?: string;
}

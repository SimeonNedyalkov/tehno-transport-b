import { IsDate } from 'class-validator';
import { Timestamp } from 'firebase/firestore';

export class CreateCustomerDto {
  brand: string;
  firstName: string;
  model: string;
  phone: number;
  regNumber: string;

  createdAt?: Date | Timestamp;

  @IsDate()
  dateOfTehnoTest: Date | Timestamp;
  daysRemaining?: string;
  status?: string;
}

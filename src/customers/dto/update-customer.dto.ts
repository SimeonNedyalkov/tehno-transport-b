import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-customer.dto';
import { IsDate } from 'class-validator';
import { Timestamp } from 'firebase/firestore';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  id?: string;
  brand: string;
  firstName: string;
  model: string;
  phone: number;
  regNumber: string;

  createdAt: Date | Timestamp;

  @IsDate()
  dateOfTehnoTest: Date | Timestamp | { seconds: number; nanoseconds: number };
  daysRemaining: string;
  status: string;
}

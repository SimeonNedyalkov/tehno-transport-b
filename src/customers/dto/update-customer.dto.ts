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

  createdAt: Timestamp;

  @IsDate()
  dateOfLastTehnoTest: Timestamp;
  // daysRemaining: number;
  // status: string;
}

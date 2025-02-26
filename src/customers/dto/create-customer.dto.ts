import { IsDate } from 'class-validator';

export class CreateCustomerDto {
  brand: string;
  firstName: string;
  model: string;
  phone: number;
  regNumber: string;

  createdAt: Date;

  @IsDate()
  dateOfTehnoTest: Date;
  daysRemaining: string;
  status: string;
}

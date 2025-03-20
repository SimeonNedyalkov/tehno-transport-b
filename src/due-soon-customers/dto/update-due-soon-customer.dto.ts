import { PartialType } from '@nestjs/mapped-types';
import { CreateDueSoonCustomerDto } from './create-due-soon-customer.dto';

export class UpdateDueSoonCustomerDto extends PartialType(CreateDueSoonCustomerDto) {}

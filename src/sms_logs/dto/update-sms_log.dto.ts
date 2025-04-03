import { PartialType } from '@nestjs/mapped-types';
import { CreateSmsLogDto } from './create-sms_log.dto';

export class UpdateSmsLogDto extends PartialType(CreateSmsLogDto) {}

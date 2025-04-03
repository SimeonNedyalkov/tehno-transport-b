import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SmsLogsService } from './sms_logs.service';
import { CreateSmsLogDto } from './dto/create-sms_log.dto';
import { UpdateSmsLogDto } from './dto/update-sms_log.dto';
import { FirebaseAuthGuard } from 'src/guards/firebase.guard';

@Controller('sms-logs')
export class SmsLogsController {
  constructor(private readonly smsLogsService: SmsLogsService) {}

  @Post()
  create(@Body() createSmsLogDto: CreateSmsLogDto) {
    return this.smsLogsService.create(createSmsLogDto);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  findAll() {
    return this.smsLogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.smsLogsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSmsLogDto: UpdateSmsLogDto) {
    return this.smsLogsService.update(+id, updateSmsLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.smsLogsService.remove(+id);
  }
}

import { Injectable } from '@nestjs/common';
import { CreateSmsLogDto } from './dto/create-sms_log.dto';
import { UpdateSmsLogDto } from './dto/update-sms_log.dto';
import { db } from 'src/firebaseConfig/firebase';
@Injectable()
export class SmsLogsService {
  create(createSmsLogDto: CreateSmsLogDto) {
    return 'This action adds a new smsLog';
  }

  async findAll() {
    const usersSnapshot = await db.collection('sms_logs').get();
    return usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  findOne(id: number) {
    return `This action returns a #${id} smsLog`;
  }

  update(id: number, updateSmsLogDto: UpdateSmsLogDto) {
    return `This action updates a #${id} smsLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} smsLog`;
  }
}

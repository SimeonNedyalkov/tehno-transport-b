import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { db } from 'src/firebaseConfig/firebase';
@Injectable()
export class MessageService {
  create(createMessageDto: CreateMessageDto) {
    return 'This action adds a new message';
  }

  async findAll() {
    try {
      const usersSnapshot = await db.collection('message').get();
      const messages = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return messages;
    } catch (error) {
      console.log('Error fetching messages:', error);
      throw new Error('Error fetching messages');
    }
  }

  async findOne(id: string) {
    const customerRef = db.collection('message').doc(id);
    const customerDoc = await customerRef.get();

    if (!customerDoc.exists) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return { id: customerDoc.id, ...customerDoc.data() };
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}

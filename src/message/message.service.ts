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

  async update(id: string, updateMessageDto: UpdateMessageDto) {
    console.log('Updating message with ID:', id);
    console.log('Update data:', updateMessageDto);

    const docRef = db.collection('message').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    try {
      await docRef.update(updateMessageDto);
      const updatedDoc = await docRef.get();
      console.log('Updated document:', updatedDoc.data()); // Log the updated doc
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      console.error('Error updating document:', error);
      throw new Error('Failed to update message.');
    }
  }

  remove(id: string) {
    return `This action removes message with ID ${id}`;
  }
}

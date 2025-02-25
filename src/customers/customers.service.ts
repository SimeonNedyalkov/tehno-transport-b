import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { db } from 'src/firebaseConfig/firebase';

@Injectable()
export class CustomersService {
  async create(createCustomerDto: CreateCustomerDto) {
    return;
  }

  async findAll() {
    const usersSnapshot = await db.collection('customers').get();
    return usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  findOne(id: number) {
    return `This action returns a #${id} customer`;
  }

  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return `This action updates a #${id} customer`;
  }

  remove(id: number) {
    return `This action removes a #${id} customer`;
  }
}

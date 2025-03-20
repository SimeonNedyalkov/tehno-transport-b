import { Injectable } from '@nestjs/common';
import { CreateDueSoonCustomerDto } from './dto/create-due-soon-customer.dto';
import { UpdateDueSoonCustomerDto } from './dto/update-due-soon-customer.dto';
import { db } from 'src/firebaseConfig/firebase';
@Injectable()
export class DueSoonCustomersService {
  async create(createDueSoonCustomerDto: CreateDueSoonCustomerDto) {
    try {
      const customerRef = await db.collection('dueSoonCustomers');

      const customerDoc = customerRef.doc(createDueSoonCustomerDto.id);
      await customerDoc.set(createDueSoonCustomerDto);

      return { message: 'Due soon customer added successfully' };
    } catch (error) {
      console.error('Error adding due soon customer:', error);
      throw new Error('Failed to add due soon customer');
    }
  }

  async findAll() {
    const usersSnapshot = await db.collection('dueSoonCustomers').get();
    return usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async findOne(id: string) {
    try {
      const customerRef = await db.collection('dueSoonCustomers').doc(id);
      const customerDoc = await customerRef.get();

      if (!customerDoc.exists) {
        throw new Error('Customer not found');
      }

      return customerDoc.data();
    } catch (error) {
      console.error(`Error fetching due soon customer with ID ${id}:`, error);
      throw new Error(`Failed to retrieve due soon customer with ID ${id}`);
    }
  }

  update(id: number, updateDueSoonCustomerDto: UpdateDueSoonCustomerDto) {
    return `This action updates a #${id} dueSoonCustomer`;
  }

  async remove(id: string) {
    try {
      const customerRef = await db.collection('dueSoonCustomers').doc(id);

      await customerRef.delete();
      return { message: 'Due soon customer removed successfully' };
    } catch (error) {
      console.error(`Error deleting due soon customer with ID ${id}:`, error);
      throw new Error(`Failed to delete due soon customer with ID ${id}`);
    }
  }
}

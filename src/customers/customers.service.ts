import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { db } from 'src/firebaseConfig/firebase';

@Injectable()
export class CustomersService {
  // Create a new customer
  async create(createCustomerDto: CreateCustomerDto) {
    const customerRef = await db.collection('customers').add(createCustomerDto);
    const newCustomer = await customerRef.get();
    return { id: newCustomer.id, ...newCustomer.data() };
  }

  // Get all customers
  async findAll() {
    const usersSnapshot = await db.collection('customers').get();
    return usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  // Get a single customer by ID
  async findOne(id: string) {
    const customerRef = db.collection('customers').doc(id);
    const customerDoc = await customerRef.get();

    if (!customerDoc.exists) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return { id: customerDoc.id, ...customerDoc.data() };
  }

  // Update a customer
  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const customerRef = db.collection('customers').doc(id);
    const customerDoc = await customerRef.get();

    if (!customerDoc.exists) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    const updateData = JSON.parse(JSON.stringify(updateCustomerDto));

    await customerRef.update(updateData);
    const updatedCustomer = await customerRef.get();
    return { id: updatedCustomer.id, ...updatedCustomer.data() };
  }

  // Delete a customer
  async remove(id: string) {
    const customerRef = db.collection('customers').doc(id);
    const customerDoc = await customerRef.get();

    if (!customerDoc.exists) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    await customerRef.delete();
    return { message: `Customer with ID ${id} deleted successfully` };
  }
}

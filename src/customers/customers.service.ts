import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { db } from 'src/firebaseConfig/firebase';
import { Timestamp } from 'firebase/firestore';
import * as dayjs from 'dayjs';

@Injectable()
export class CustomersService {
  // Create a new customer
  async create(createCustomerDto: CreateCustomerDto) {
    const today = dayjs();
    const createdAt = new Date(); // Create `createdAt` field as current date

    // Handle the date conversion of `dateOfTehnoTest`
    const testDate =
      createCustomerDto.dateOfTehnoTest instanceof Timestamp
        ? dayjs(createCustomerDto.dateOfTehnoTest.toDate())
        : dayjs(createCustomerDto.dateOfTehnoTest);

    // Calculate the remaining days
    const daysRemaining = testDate.diff(today, 'days');

    // Determine status based on daysRemaining
    let status = 'Upcoming';
    if (daysRemaining < 0) {
      status = 'Overdue';
    } else if (daysRemaining <= 7) {
      status = 'Due Soon';
    }

    // Add `createdAt`, `daysRemaining`, and `status` fields
    const customerWithStatus = {
      ...createCustomerDto,
      createdAt, // Add `createdAt` as current date
      daysRemaining, // Add the calculated days remaining
      status, // Add status based on the days remaining
    };

    // Add the customer to Firestore
    const customerRef = await db
      .collection('customers')
      .add(customerWithStatus);

    // Ensure that the newly added customer includes all the necessary fields by retrieving it again
    const newCustomer = await customerRef.get();
    const customerData = newCustomer.data();

    // Return the new customer data along with the generated id and ensure it includes the fields
    return {
      id: customerRef.id,
      brand: customerData?.brand,
      firstName: customerData?.firstName,
      model: customerData?.model,
      phone: customerData?.phone,
      regNumber: customerData?.regNumber,
      dateOfTehnoTest: customerData?.dateOfTehnoTest,
      createdAt: customerData?.createdAt,
      daysRemaining: customerData?.daysRemaining,
      status: customerData?.status,
    };
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

    try {
      const updateData = JSON.parse(JSON.stringify(updateCustomerDto));
      await customerRef.update(updateData);
      const updatedCustomer = await customerRef.get();
      return { id: updatedCustomer.id, ...updatedCustomer.data() };
    } catch (error) {
      throw new UnauthorizedException('Error updating customer');
    }
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
  async updateOrCreate(id: string, updateCustomerDto: UpdateCustomerDto) {
    const customerRef = db.collection('customers').doc(id);
    const customerDoc = await customerRef.get();

    if (customerDoc.exists) {
      // If the customer exists, update it
      const updateData = JSON.parse(JSON.stringify(updateCustomerDto));
      await customerRef.update(updateData);
      const updatedCustomer = await customerRef.get();
      return { id: updatedCustomer.id, ...updatedCustomer.data() };
    } else {
      // If the customer does not exist, create it
      const createdAt = new Date(); // Current timestamp

      // Handle the date conversion of `dateOfTehnoTest`
      const today = dayjs();
      const testDate =
        updateCustomerDto.dateOfTehnoTest instanceof Timestamp
          ? dayjs(updateCustomerDto.dateOfTehnoTest.toDate())
          : dayjs(updateCustomerDto.dateOfTehnoTest);

      const daysRemaining = testDate.diff(today, 'days');

      let status = 'Upcoming';
      if (daysRemaining < 0) {
        status = 'Overdue';
      } else if (daysRemaining <= 7) {
        status = 'Due Soon';
      }

      // Create new customer data
      const newCustomerData = {
        ...updateCustomerDto,
        createdAt,
        daysRemaining,
        status,
      };

      // Save in Firestore
      await customerRef.set(newCustomerData);

      return { id: customerRef.id, ...newCustomerData };
    }
  }
}

import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { db } from 'src/firebaseConfig/firebase';
import { Timestamp } from 'firebase-admin/firestore';

@Injectable()
export class CustomersService {
  // Create a new customer
  async create(createCustomerDto: CreateCustomerDto) {
    const createdAt = new Date();
    console.log(typeof createCustomerDto.dateOfTehnoTest);

    let formattedDateOfTehnoTest: Timestamp;

    if (
      createCustomerDto.dateOfTehnoTest &&
      typeof createCustomerDto.dateOfTehnoTest === 'object' &&
      'seconds' in createCustomerDto.dateOfTehnoTest
    ) {
      formattedDateOfTehnoTest = new Timestamp(
        createCustomerDto.dateOfTehnoTest.seconds,
        createCustomerDto.dateOfTehnoTest.nanoseconds,
      );
    } else if (createCustomerDto.dateOfTehnoTest instanceof Date) {
      formattedDateOfTehnoTest = Timestamp.fromDate(
        createCustomerDto.dateOfTehnoTest,
      );
    } else {
      throw new Error('Invalid dateOfTehnoTest format');
    }

    const customerWithStatus = {
      ...createCustomerDto,
      createdAt,
      dateOfTehnoTest: formattedDateOfTehnoTest,
    };

    // Add the customer to Firestore
    const customerRef = await db
      .collection('customers')
      .add(customerWithStatus);

    // Retrieve the newly added customer
    const newCustomer = await customerRef.get();
    const customerData = newCustomer.data();

    return {
      id: customerRef.id,
      brand: customerData?.brand,
      firstName: customerData?.firstName,
      model: customerData?.model,
      phone: customerData?.phone,
      regNumber: customerData?.regNumber,
      dateOfTehnoTest: customerData?.dateOfTehnoTest,
      createdAt: new Timestamp(
        customerData?.createdAt._seconds,
        customerData?.createdAt._nanoseconds,
      ),
      // daysRemaining: customerData?.daysRemaining,
      // status: customerData?.status,
    };
  }

  // Get all customers
  async findAll() {
    const usersSnapshot = await db.collection('customers').get();
    return usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
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
  // Update a customer
  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const customerRef = db.collection('customers').doc(id);
    const customerDoc = await customerRef.get();

    if (!customerDoc.exists) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Try updating the customer
    try {
      const updateData = JSON.parse(JSON.stringify(updateCustomerDto));
      const { status, daysRemaining, ...restOfUpdateDto } = updateData;

      await customerRef.update({
        ...restOfUpdateDto,
        // status: newStatus,
        // daysRemaining: newDaysRemaining, // Correct field name here
      });

      // Return the updated customer data
      const updatedCustomer = await customerRef.get();
      return { id: updatedCustomer.id, ...updatedCustomer.data() };
    } catch (error) {
      // Handle error with a more appropriate exception
      throw new InternalServerErrorException('Error updating customer');
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
}

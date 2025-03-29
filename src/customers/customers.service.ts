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
      createdAt: customerData?.createdAt,
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
      console.log(restOfUpdateDto?.dateOfTehnoTest);
      let formattedDateOfTehnoTest: Timestamp;
      if (
        updateCustomerDto.dateOfTehnoTest &&
        typeof updateCustomerDto.dateOfTehnoTest === 'object' &&
        'seconds' in updateCustomerDto.dateOfTehnoTest
      ) {
        formattedDateOfTehnoTest = new Timestamp(
          updateCustomerDto.dateOfTehnoTest.seconds,
          updateCustomerDto.dateOfTehnoTest.nanoseconds,
        );
      } else if (updateCustomerDto.dateOfTehnoTest instanceof Date) {
        formattedDateOfTehnoTest = Timestamp.fromDate(
          updateCustomerDto.dateOfTehnoTest,
        );
      } else {
        throw new Error('Invalid dateOfTehnoTest format');
      }
      const convertToTimestamp = (input: any): Timestamp | null => {
        if (!input) return null;

        if (input instanceof Timestamp) {
          return input; // Already a Firestore Timestamp
        }

        if (input instanceof Date) {
          return Timestamp.fromDate(input); // Convert Date to Firestore Timestamp
        }

        if (typeof input === 'object') {
          const seconds = input.seconds ?? input._seconds; // Handle both cases
          const nanoseconds = input.nanoseconds ?? input._nanoseconds;

          if (typeof seconds === 'number' && typeof nanoseconds === 'number') {
            return new Timestamp(seconds, nanoseconds);
          }
        }

        return null; // Invalid format
      };
      let formattedCreatedAt: Timestamp | null = null;
      formattedCreatedAt = convertToTimestamp(updateCustomerDto.createdAt);
      await customerRef.update({
        ...restOfUpdateDto,
        dateOfTehnoTest: formattedDateOfTehnoTest,
        createdAt: formattedCreatedAt,
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
  convertToTimestamp = (input: any): Timestamp | null => {
    if (!input) return null;

    if (input instanceof Timestamp) {
      return input; // Already a Firestore Timestamp
    }

    if (input instanceof Date) {
      return Timestamp.fromDate(input); // Convert Date to Firestore Timestamp
    }

    if (typeof input === 'object') {
      const seconds = input.seconds ?? input._seconds; // Handle both cases
      const nanoseconds = input.nanoseconds ?? input._nanoseconds;

      if (typeof seconds === 'number' && typeof nanoseconds === 'number') {
        return new Timestamp(seconds, nanoseconds);
      }
    }

    return null; // Invalid format
  };

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

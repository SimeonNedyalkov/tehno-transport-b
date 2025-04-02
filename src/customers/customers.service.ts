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

    let formattedDateOfLastTehnoTest: Timestamp;

    if (
      createCustomerDto.dateOfLastTehnoTest &&
      typeof createCustomerDto.dateOfLastTehnoTest === 'object' &&
      'seconds' in createCustomerDto.dateOfLastTehnoTest
    ) {
      formattedDateOfLastTehnoTest = new Timestamp(
        createCustomerDto.dateOfLastTehnoTest.seconds,
        createCustomerDto.dateOfLastTehnoTest.nanoseconds,
      );
    } else if (createCustomerDto.dateOfLastTehnoTest instanceof Date) {
      formattedDateOfLastTehnoTest = Timestamp.fromDate(
        createCustomerDto.dateOfLastTehnoTest,
      );
    } else if (typeof createCustomerDto.dateOfLastTehnoTest === 'string') {
      const newDate = new Date(createCustomerDto.dateOfLastTehnoTest);
      formattedDateOfLastTehnoTest = Timestamp.fromDate(newDate);
    } else {
      throw new Error('Invalid dateOfLastTehnoTest format');
    }

    const customerWithStatus = {
      ...createCustomerDto,
      createdAt,
      dateOfLastTehnoTest: formattedDateOfLastTehnoTest,
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
      dateOfLastTehnoTest: customerData?.dateOfLastTehnoTest,
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
      console.log(restOfUpdateDto?.dateOfLastTehnoTest);
      let formattedDateOfLastTehnoTest: Timestamp;

      if (
        updateCustomerDto.dateOfLastTehnoTest &&
        typeof updateCustomerDto.dateOfLastTehnoTest === 'object' &&
        'seconds' in updateCustomerDto.dateOfLastTehnoTest
      ) {
        formattedDateOfLastTehnoTest = new Timestamp(
          updateCustomerDto.dateOfLastTehnoTest.seconds,
          updateCustomerDto.dateOfLastTehnoTest.nanoseconds,
        );
      } else if (updateCustomerDto.dateOfLastTehnoTest instanceof Date) {
        formattedDateOfLastTehnoTest = Timestamp.fromDate(
          updateCustomerDto.dateOfLastTehnoTest,
        );
      } else if (typeof updateCustomerDto.dateOfLastTehnoTest === 'string') {
        const newDate = new Date(updateCustomerDto.dateOfLastTehnoTest);
        formattedDateOfLastTehnoTest = Timestamp.fromDate(newDate);
      } else {
        throw new Error('Invalid dateOfLastTehnoTest format');
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
        dateOfLastTehnoTest: formattedDateOfLastTehnoTest,
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

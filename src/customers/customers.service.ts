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
    const createdAt = new Date(); // Current timestamp

    let testDate: Date;
    if (createCustomerDto.dateOfTehnoTest instanceof Timestamp) {
      // If it's a Firebase Timestamp
      testDate = createCustomerDto.dateOfTehnoTest.toDate();
    } else if (createCustomerDto.dateOfTehnoTest instanceof Date) {
      // If it's already a Date object
      testDate = createCustomerDto.dateOfTehnoTest;
    } else {
      // If it's an object with seconds and nanoseconds (common in Firestore documents)
      testDate = new Date(createCustomerDto.dateOfTehnoTest.seconds * 1000);
    }
    const lastTehnoDate = testDate.toISOString().split('T')[0];

    // Add one year to the test date
    testDate.setFullYear(testDate.getFullYear() + 1);
    const nextTehnoDate = testDate.toISOString().split('T')[0];

    // Get today's date
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    const todaysDate = yyyy + '-' + mm + '-' + dd;

    // Convert dates to Date objects
    const nextTehnoDateObj: any = new Date(nextTehnoDate);
    const todayObj: any = new Date(today);

    // Calculate the difference in milliseconds
    const timeDiff = nextTehnoDateObj - todayObj;

    // Convert milliseconds to days
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Determine status based on daysRemaining
    let status = 'Upcoming';
    if (isNaN(daysRemaining)) {
      status = 'Invalid Date';
    } else if (daysRemaining < 0) {
      status = 'Overdue';
    } else if (daysRemaining <= 7) {
      status = 'Due Soon';
    }

    // Construct the customer object with additional fields
    const customerWithStatus = {
      ...createCustomerDto,
      createdAt,
      daysRemaining,
      status,
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

import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { db } from 'src/firebaseConfig/firebase';
import { Timestamp } from 'firebase/firestore';

const calculateDaysRemaining = (testDate: Date) => {
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
  return daysRemaining;
};

const getStatus = (daysRemaining: number) => {
  let status = 'Upcoming';
  if (isNaN(daysRemaining)) {
    status = 'Invalid Date';
  } else if (daysRemaining < 0) {
    status = 'Overdue';
  } else if (daysRemaining <= 7) {
    status = 'Due Soon';
  }
  return status;
};

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
    // const lastTehnoDate = testDate.toISOString().split('T')[0];

    // // Add one year to the test date
    // testDate.setFullYear(testDate.getFullYear() + 1);
    // const nextTehnoDate = testDate.toISOString().split('T')[0];

    // // Get today's date
    // const today = new Date();
    // const dd = String(today.getDate()).padStart(2, '0');
    // const mm = String(today.getMonth() + 1).padStart(2, '0');
    // const yyyy = today.getFullYear();

    // const todaysDate = yyyy + '-' + mm + '-' + dd;

    // // Convert dates to Date objects
    // const nextTehnoDateObj: any = new Date(nextTehnoDate);
    // const todayObj: any = new Date(today);

    // // Calculate the difference in milliseconds
    // const timeDiff = nextTehnoDateObj - todayObj;

    // // Convert milliseconds to days
    // const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const daysRemaining = calculateDaysRemaining(testDate);
    // Determine status based on daysRemaining
    let status = getStatus(daysRemaining);

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

    // Centralize date conversion logic
    let testDate: Date;
    if (updateCustomerDto.dateOfTehnoTest instanceof Timestamp) {
      testDate = updateCustomerDto.dateOfTehnoTest.toDate();
    } else if (updateCustomerDto.dateOfTehnoTest instanceof Date) {
      testDate = updateCustomerDto.dateOfTehnoTest;
    } else if (
      updateCustomerDto.dateOfTehnoTest &&
      updateCustomerDto.dateOfTehnoTest.seconds
    ) {
      testDate = new Date(updateCustomerDto.dateOfTehnoTest.seconds * 1000);
    } else {
      throw new UnauthorizedException('Invalid dateOfTehnoTest format');
    }

    const newDaysRemaining = calculateDaysRemaining(testDate);
    const newStatus = getStatus(newDaysRemaining);

    // If the date conversion or status calculation failed, return an error
    if (newStatus === 'Invalid Date') {
      throw new UnauthorizedException('Invalid dateOfTehnoTest');
    }

    // Try updating the customer
    try {
      // Remove fields from updateCustomerDto that shouldn't be updated

      const updateData = JSON.parse(JSON.stringify(updateCustomerDto));
      const { status, daysRemaining, ...restOfUpdateDto } = updateData;

      // Update the customer in Firestore with the correct fields
      await customerRef.update({
        ...restOfUpdateDto,
        status: newStatus,
        daysRemaining: newDaysRemaining, // Correct field name here
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
  // async updateOrCreate(id: string, updateCustomerDto: UpdateCustomerDto) {
  //   const customerRef = db.collection('customers').doc(id);
  //   const customerDoc = await customerRef.get();

  //   if (customerDoc.exists) {
  //     // If the customer exists, update it
  //     const updateData = JSON.parse(JSON.stringify(updateCustomerDto));
  //     await customerRef.update(updateData);
  //     const updatedCustomer = await customerRef.get();
  //     return { id: updatedCustomer.id, ...updatedCustomer.data() };
  //   } else {
  //     // If the customer does not exist, create it
  //     const createdAt = new Date(); // Current timestamp

  //     // Handle the date conversion of `dateOfTehnoTest`
  //     let testDate: Date;
  //     if (updateCustomerDto.dateOfTehnoTest instanceof Timestamp) {
  //       // If it's a Firebase Timestamp
  //       testDate = updateCustomerDto.dateOfTehnoTest.toDate();
  //     } else if (updateCustomerDto.dateOfTehnoTest instanceof Date) {
  //       // If it's already a Date object
  //       testDate = updateCustomerDto.dateOfTehnoTest;
  //     } else {
  //       // If it's an object with seconds and nanoseconds (common in Firestore documents)
  //       testDate = new Date(updateCustomerDto.dateOfTehnoTest.seconds * 1000);
  //     }
  //     const lastTehnoDate = testDate.toISOString().split('T')[0];

  //     // Add one year to the test date
  //     testDate.setFullYear(testDate.getFullYear() + 1);
  //     const nextTehnoDate = testDate.toISOString().split('T')[0];

  //     // Get today's date
  //     const today = new Date();
  //     const dd = String(today.getDate()).padStart(2, '0');
  //     const mm = String(today.getMonth() + 1).padStart(2, '0');
  //     const yyyy = today.getFullYear();

  //     const todaysDate = yyyy + '-' + mm + '-' + dd;

  //     // Convert dates to Date objects
  //     const nextTehnoDateObj: any = new Date(nextTehnoDate);
  //     const todayObj: any = new Date(today);

  //     // Calculate the difference in milliseconds
  //     const timeDiff = nextTehnoDateObj - todayObj;

  //     // Convert milliseconds to days
  //     const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

  //     // Determine status based on daysRemaining
  //     let status = 'Upcoming';
  //     if (isNaN(daysRemaining)) {
  //       status = 'Invalid Date';
  //     } else if (daysRemaining < 0) {
  //       status = 'Overdue';
  //     } else if (daysRemaining <= 7) {
  //       status = 'Due Soon';
  //     }

  //     // Create new customer data
  //     const newCustomerData = {
  //       ...updateCustomerDto,
  //       createdAt,
  //       daysRemaining,
  //       status,
  //     };

  //     // Save in Firestore
  //     await customerRef.set(newCustomerData);

  //     return { id: customerRef.id, ...newCustomerData };
  //   }
  // }
  // async saveAll(customers: UpdateCustomerDto[]) {
  //   const batch = db.batch(); // Initialize batch write
  //   const today = dayjs();

  //   for (const customer of customers) {
  //     const customerRef = db.collection("customers").doc(customer.id);
  //     const customerDoc = await customerRef.get();

  //     const testDate =
  //       customer.dateOfTehnoTest instanceof Timestamp
  //         ? dayjs(customer.dateOfTehnoTest.toDate())
  //         : dayjs(customer.dateOfTehnoTest);

  //     const daysRemaining = testDate.diff(today, "days");

  //     let status = "Upcoming";
  //     if (daysRemaining < 0) {
  //       status = "Overdue";
  //     } else if (daysRemaining <= 7) {
  //       status = "Due Soon";
  //     }

  //     const customerData = {
  //       ...customer,
  //       createdAt: customerDoc.exists ? customerDoc.data().createdAt : new Date(),
  //       daysRemaining,
  //       status,
  //     };

  //     if (customerDoc.exists) {
  //       // Update existing customer
  //       batch.update(customerRef, customerData);
  //     } else {
  //       // Create new customer
  //       batch.set(customerRef, customerData);
  //     }
  //   }

  //   await batch.commit(); // Commit all operations
  //   return { message: "All customers updated/created successfully" };
  // }
}

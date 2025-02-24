import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import * as firebaseAdmin from 'firebase-admin';

@Injectable()
export class UserService {
  async registerUser(registerUser: RegisterUserDto) {
    try {
      const userRecord = await firebaseAdmin.auth().createUser({
        email: registerUser.email,
        password: registerUser.password,
      });
      const emailVerificationLink = await firebaseAdmin
        .auth()
        .generateEmailVerificationLink(registerUser.email);
      console.log('Email Verification Link:', emailVerificationLink);
      return {
        message: 'User registered successfully. Verification email sent.',
        user: userRecord,
        emailVerificationLink,
      };
    } catch (error) {
      console.error('Firebase Error:', error);
      throw new Error(`User registration failed: ${error.message}`);
    }
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

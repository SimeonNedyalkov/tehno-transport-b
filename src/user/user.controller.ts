import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Headers,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.userService.registerUser(registerUserDto);
  }

  @Post('login')
  async loginUser(@Body() loginDto: LoginDto, @Res() res: Response) {
    const { idToken, refreshToken } =
      await this.userService.loginUser(loginDto);

    // Set token in an HTTP-only cookie
    res.cookie('authToken', idToken, {
      httpOnly: true, // Prevent XSS
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS
      sameSite: 'lax',
    });

    return res.json({ message: 'Login successful', refreshToken });
  }

  @Post('logout')
  async logoutUser(@Headers('authorization') authHeader: string) {
    try {
      const response = await this.userService.logoutUser(authHeader);
      return response;
    } catch (error) {
      throw new Error('Failed to logout user');
    }
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}

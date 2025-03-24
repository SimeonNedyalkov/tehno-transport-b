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
  Res,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { Response, Request } from 'express';

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
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Prevent XSS
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS
      sameSite: 'lax',
    });

    return res.json({ message: 'Login successful', refreshToken, idToken });
  }
  @Post('refresh-auth')
  async refreshAuth(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token missing' });
    }

    try {
      const result = await this.userService.refreshAuthToken(refreshToken);
      res.cookie('authToken', result.idToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      return res.json(result);
    } catch (error) {
      console.error('Error during token refresh:', error);
      return res
        .status(500)
        .json({ error: 'Failed to refresh token', details: error.message });
    }
  }

  @Post('logout')
  async logoutUser(@Req() req: Request, @Res() res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken; // Get refresh token from cookies
      if (!refreshToken) {
        return res.status(400).json({ message: 'No refresh token provided' });
      }

      await this.userService.logoutUser(refreshToken);

      // Clear auth cookies
      res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Firebase Error:', error.response?.data || error.message);
      return res
        .status(500)
        .json({ error: 'Authentication failed', details: error.message });
    }
  }

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto);
  // }

  @Get('getUser')
  async findUser(@Req() req: Request): Promise<any> {
    const authToken = req.cookies.authToken;
    return await this.userService.findUser(authToken);
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

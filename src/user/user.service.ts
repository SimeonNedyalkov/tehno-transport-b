import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import * as firebaseAdmin from 'firebase-admin';
import { LoginDto } from './dto/login-user.dto';
import axios from 'axios';
import * as nodemailer from 'nodemailer';

@Injectable()
export class UserService {
  validateToken(authHeader: string) {
    throw new Error('Method not implemented.');
  }
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
      await this.sendAdminVerificationEmail(
        registerUser.email,
        emailVerificationLink,
      );
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

  async loginUser(payload: LoginDto) {
    const { email, password } = payload;
    try {
      const {
        idToken,
        refreshToken,
        expiresIn,
        localId: uid,
      } = await this.signInWithEmailAndPassword(email, password);
      const user = await firebaseAdmin.auth().getUser(uid);
      if (!user.emailVerified) {
        throw new Error('Email not verified. Please wait for admin approval.');
      }
      return { idToken, refreshToken, expiresIn };
    } catch (error: any) {
      if (error.message.includes('EMAIL_NOT_FOUND')) {
        throw new Error('User not found');
      } else if (error.message.includes('INVALID_PASSWORD')) {
        throw new Error('Invalid password');
      } else {
        throw new Error(error.message);
      }
    }
  }
  private async signInWithEmailAndPassword(email: string, password: string) {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.APIKEY}`;
    return await this.sendPostRequest(url, {
      email,
      password,
      returnSecureToken: true,
    });
  }

  private async sendPostRequest(url: string, data: any) {
    try {
      const response = await axios.post(url, data, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error: any) {
      console.error(
        'Firebase Authentication Error:',
        error.response?.data || error.message,
      );
      throw new Error(
        error.response?.data?.error?.message ||
          'Firebase Authentication request failed',
      );
    }
  }
  async validateRequest(req): Promise<boolean> {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      console.log('Authorization header not provided.');
      return false;
    }
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      console.log('Invalid authorization format. Expected "Bearer <token>".');
      return false;
    }
    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      console.log('Decoded Token:', decodedToken);
      return true;
    } catch (error) {
      if (error.code === 'auth/id-token-expired') {
        console.error('Token has expired.');
      } else if (error.code === 'auth/invalid-id-token') {
        console.error('Invalid ID token provided.');
      } else {
        console.error('Error verifying token:', error);
      }
      return false;
    }
  }

  async refreshAuthToken(refreshToken: string) {
    try {
      const {
        id_token: idToken,
        refresh_token: newRefreshToken,
        expires_in: expiresIn,
      } = await this.sendRefreshAuthTokenRequest(refreshToken);
      return {
        idToken,
        refreshToken: newRefreshToken,
        expiresIn,
      };
    } catch (error: any) {
      if (error.message.includes('INVALID_REFRESH_TOKEN')) {
        throw new Error(`Invalid refresh token: ${refreshToken}.`);
      } else {
        throw new Error('Failed to refresh token');
      }
    }
  }
  private async sendRefreshAuthTokenRequest(refreshToken: string) {
    const url = `https://securetoken.googleapis.com/v1/token?key=${process.env.APIKEY}`;
    const payload = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };
    return await this.sendPostRequest(url, payload);
  }

  async logoutUser(refreshToken: string) {
    try {
      const refreshTokenUrl = `https://securetoken.googleapis.com/v1/token?key=${process.env.APIKEY}`;

      // Exchange refresh token for user info
      const response = await axios.post(refreshTokenUrl, {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });

      const uid = response.data.user_id;

      // Revoke the refresh tokens for this UID
      await firebaseAdmin.auth().revokeRefreshTokens(uid);

      console.log(`Refresh token revoked for UID: ${uid}`);

      return { message: 'Logged out successfully' };
    } catch (error) {
      console.error('Error logging out:', error.message);
      throw new Error('Error logging out: ' + error.message);
    }
  }

  findAll() {
    return `This action returns all user`;
  }

  async findUser(authToken: string): Promise<any> {
    if (!authToken) {
      throw new Error('Authorization token not provided.');
    }

    try {
      // Verify the ID token using Firebase Admin SDK
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(authToken);

      // Fetch the user from Firebase using the UID from the decoded token
      const user = await firebaseAdmin.auth().getUser(decodedToken.uid);

      // Return the user details
      return {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      };
    } catch (error) {
      console.error('Error verifying token:', error);
      throw new Error('Invalid or expired token.');
    }
  }

  async updateUser(authToken: string, body: any, file: Express.Multer.File) {
    if (!authToken) {
      throw new Error('Authorization token not provided.');
    }

    const { email, displayName } = body;
    console.log(file);

    try {
      7;
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(authToken);
      const uid = decodedToken.uid;

      7;
      const updates: any = {};
      if (email) updates.email = email;
      if (displayName) updates.displayName = displayName;

      7;
      if (file && file.filename) {
        updates.photoURL = `http://localhost:3000/uploads/${file.filename}`;
        7;
      }

      // Update user in Firebase Auth (Admin SDK)
      await firebaseAdmin.auth().updateUser(uid, updates);

      return { message: 'Profile updated successfully', updates };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Profile update failed.');
    }
  }

  async updatePassword(authToken: string, body: any) {
    if (!authToken) {
      throw new Error('Authorization token not provided.');
    }

    const { newPassword } = body;
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(authToken);
    const uid = decodedToken.uid;
    try {
      await firebaseAdmin.auth().updateUser(uid, {
        password: newPassword,
      });
      return { message: 'Password updated successfully' };
    } catch (error) {
      console.error('Error updating password:', error);
      throw new Error('Password update failed.');
    }
  }

  async sendPasswordResetEmail(email: string) {
    try {
      const resetLink = await firebaseAdmin
        .auth()
        .generatePasswordResetLink(email);
      console.log('Password Reset Link:', resetLink);
      this.sendEmailToUser(email, resetLink);
      return { message: 'Password reset email sent successfully:', resetLink };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email.');
    }
  }
  async sendEmailToUser(email: string, resetLink: string) {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASSWORD,
      },
    });

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Password Reset Request',
      text: `Click the following link to reset your password: ${resetLink}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Password reset email sent');
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendAdminVerificationEmail(
    userEmail: string,
    verificationLink: string,
  ) {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'New user registration – verify their email',
      text: `User ${userEmail} has registered. Click below to verify their email:\n\n${verificationLink}`,
      html: `
        <p>User <strong>${userEmail}</strong> has just registered.</p>
        <p>Click the link below to verify their email:</p>
        <a href="${verificationLink}">${verificationLink}</a>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Verification link for ${userEmail} sent to admin.`);
    } catch (error) {
      console.error('Error sending admin verification email:', error);
      throw new Error('Failed to send admin verification email');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

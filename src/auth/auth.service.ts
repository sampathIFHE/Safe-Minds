import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import * as nodemailer from 'nodemailer';


@Injectable()
export class AuthService {
   private transporter;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
        this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendOtp(dto: SendOtpDto) {

  const user = await this.userService.findByEmail(dto.email);

  if (!user) {
    throw new NotFoundException("User not found");
  }

  const otp = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();

  user.otp = otp;

  user.otpExpiresAt = new Date(
    Date.now() + 5 * 60 * 1000,
  );

  await this.userService.save(user);

  await this.transporter.sendMail({
      from: `"Safe Minds" <${process.env.MAIL_USER}>`,
      to: dto.email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });
        console.log(`OTP ${otp} sent to ${dto.email}`);

  return {
    message: "OTP sent successfully",
  };
}

async verifyOtp(dto: VerifyOtpDto) {

  const user = await this.userService.findByEmail(dto.email);

  if (!user) {
    throw new UnauthorizedException();
  }

  if (user.otp !== dto.otp) {
    throw new UnauthorizedException("Invalid OTP");
  }

  if (!user.otpExpiresAt) {
  throw new UnauthorizedException('OTP not found');
}

  if (new Date() > user.otpExpiresAt) {
    throw new UnauthorizedException("OTP Expired");
  }

  user.otp = "";
  user.otpExpiresAt = null;
  user.isVerified = true;

  await this.userService.save(user);

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  return {
    access_token: this.jwtService.sign(payload),
  };
}
}

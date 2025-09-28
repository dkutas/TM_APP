// src/auth/auth.controller.ts
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login') login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }
  @Post('register') register(
    @Body()
    body: {
      email: string;
      password: string;
      name: string;
      admin?: boolean;
    },
  ) {
    return this.auth.register(
      body.email,
      body.password,
      body.name,
      !!body.admin,
    );
  }
  @Post('refresh') refresh(@Body() body: { refreshToken: string }) {
    return this.auth.refresh(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  me(@Req() req: any) {
    return req.user;
  }
}

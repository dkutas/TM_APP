// src/auth/auth.controller.ts
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService, JwtPayload } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

export interface AuthenticatedRequest extends Request {
  user: JwtPayload; // Adjust the type according to your user object structure
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login') login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  logout(@Req() req: AuthenticatedRequest) {
    return this.auth.logout(req.user.sub);
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
  me(@Req() req: AuthenticatedRequest) {
    return req.user;
  }
}

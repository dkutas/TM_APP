// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SystemRole } from '../user/entities/user.entity';
import * as process from 'node:process';

export interface JwtPayload {
  sub: number; // vagy string, attól függ, hogy tárolod az id-t
  email: string;
  role: SystemRole;
}

@Injectable()
export class AuthService {
  constructor(
    private users: UserService,
    private jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('No user found');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async register(
    email: string,
    password: string,
    name: string,
    admin: boolean = false,
  ) {
    const existingUser = await this.users.findByEmail(email);
    if (existingUser) throw new UnauthorizedException('Email already in use');
    await this.users.create({
      email,
      password,
      name,
      systemRole: admin ? 'SUPER_ADMIN' : 'USER',
    });
    return this.login(email, password);
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload = { sub: user.id, email: user.email, role: user.systemRole };
    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: process.env.TOKEN_EXPIRATION || '1h',
    });
    const refreshToken = await this.jwt.signAsync(payload, { expiresIn: '7d' });
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.systemRole,
      },
    };
  }

  async refresh(token: string) {
    const decoded = await this.jwt.verifyAsync<JwtPayload>(token, {
      secret: process.env.JWT_SECRET ?? 'dev_secret',
    });
    const payload = {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: process.env.TOKEN_EXPIRATION || '1h',
    });
    return { accessToken };
  }
}

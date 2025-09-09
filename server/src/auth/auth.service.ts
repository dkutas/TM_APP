// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private users: UserService,
    private jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload = { sub: user.id, email: user.email, role: user.systemRole };
    const accessToken = await this.jwt.signAsync(payload, { expiresIn: '15m' });
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const decoded = await this.jwt.verifyAsync(token, {
      secret: process.env.JWT_SECRET ?? 'dev_secret',
    });
    const payload = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      sub: decoded.sub,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      email: decoded.email,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      role: decoded.role,
    };
    const accessToken = await this.jwt.signAsync(payload, { expiresIn: '15m' });
    return { accessToken };
  }
}

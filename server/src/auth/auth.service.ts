import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import * as process from 'node:process';
import * as crypto from 'node:crypto';
import { RefreshToken } from './entities/refresh-token.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../role/entities/role.entity';
import { RoleEnum } from '../common/enums';

export interface JwtPayload {
  sub: string;
  id: string;
  email: string;
  role: Role;
  name: string;
}

function sha256(input: string) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokens: Repository<RefreshToken>,
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

  async register(email: string, password: string, name: string) {
    const existingUser = await this.users.findByEmail(email);
    if (existingUser)
      throw new ForbiddenException({
        message: 'Email already in use',
        field: 'email',
      });
    await this.users.create({
      email,
      password,
      name,
      systemRole: RoleEnum.USER,
    });
    return this.login(email, password);
  }

  async login(email: string, password: string) {
    console.log(email, password);
    const user = await this.validateUser(email, password);
    const accessToken = await this.signAccessToken(user);
    const { token: refreshToken, expiresAt } =
      await this.issueRefreshToken(user);
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.systemRole,
      },
      refreshTokenExpiresAt: expiresAt,
    };
  }

  async logout(userId: string) {
    const tokens = await this.refreshTokens.find({
      where: { user: { id: userId } },
    });
    for (const t of tokens) {
      if (!t.revokedAt) {
        t.revokedAt = new Date();
      }
    }
    await this.refreshTokens.save(tokens);
    return { success: true };
  }

  async refresh(refreshToken: string) {
    const tokenHash = sha256(refreshToken);
    const rt = await this.refreshTokens.findOne({
      where: { tokenHash },
      relations: ['user'],
    });
    if (!rt) throw new UnauthorizedException('Invalid refresh token');
    if (rt.revokedAt) throw new ForbiddenException('Refresh token revoked');
    if (rt.expiresAt.getTime() < Date.now())
      throw new UnauthorizedException('Refresh token expired');

    rt.revokedAt = new Date();
    const newIssue = await this.issueRefreshToken(rt.user);
    rt.replacedByTokenHash = sha256(newIssue.token);
    await this.refreshTokens.save(rt);

    const accessToken = await this.signAccessToken(rt.user);
    return {
      accessToken,
      refreshToken: newIssue.token,
      refreshTokenExpiresAt: newIssue.expiresAt,
    };
  }

  async revokeRefreshToken(refreshToken: string) {
    const tokenHash = sha256(refreshToken);
    const rt = await this.refreshTokens.findOne({ where: { tokenHash } });
    if (rt) {
      rt.revokedAt = new Date();
      await this.refreshTokens.save(rt);
    }
    return { success: true };
  }

  private async signAccessToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.systemRole,
      name: user.name,
    };
    return await this.jwt.signAsync(payload, {
      expiresIn: process.env.TOKEN_EXPIRATION || '15m',
    });
  }

  private async issueRefreshToken(user: User) {
    const token = crypto.randomBytes(48).toString('hex');
    const tokenHash = sha256(token);
    const expires = new Date(Date.now() + 7 * 24 * 3600 * 1000);

    const rt = this.refreshTokens.create({
      user,
      tokenHash,
      expiresAt: expires,
    });
    await this.refreshTokens.save(rt);
    return { token, expiresAt: expires };
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ApiBody } from '@nestjs/swagger';
import { MembershipService } from '../membership/membership.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly memberships: MembershipService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Get(':id/memberships')
  async listUserMemberships(@Param('id') id: string) {
    const memberships = await this.memberships.findByUser(id);
    return memberships.map((m) => ({
      projectId: m.project.id,
      projectKey: m.project.key,
      projectName: m.project.name,
      role: m.role,
    }));
  }

  @Patch(':id')
  @ApiBody({ type: UpdateUserDto })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}

import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(createUserDto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    const user = this.repo.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: passwordHash,
      systemRole: createUserDto.systemRole,
    });
    return this.repo.save(user);
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findByName(name: string) {
    return this.repo.findOne({ where: { name } });
  }

  findAll() {
    return this.repo.find({
      select: ['id', 'name', 'email', 'systemRole', 'createdAt'],
    });
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.repo.update(id, updateUserDto);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}

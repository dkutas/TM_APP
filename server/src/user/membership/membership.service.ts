// src/memberships/memberships.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectMembership } from '../../role/entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(ProjectMembership)
    private readonly repo: Repository<ProjectMembership>,
  ) {}

  async findByUser(userId: string) {
    return this.repo.find({
      where: { user: { id: userId } },
      relations: ['project', 'role'],
      select: {
        id: true,
        project: { id: true, name: true, key: true },
        role: { id: true, name: true },
      },
      order: { project: { createdAt: 'ASC' } },
    });
  }
}

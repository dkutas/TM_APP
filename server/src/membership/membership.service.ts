import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectMembership } from './entity/project-membership.entity';

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

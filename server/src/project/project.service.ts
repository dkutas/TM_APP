import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { ProjectMembership } from '../role/entities/role.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(ProjectMembership)
    private memberShipRepo: Repository<ProjectMembership>,
  ) {}

  create(createProjectDto: CreateProjectDto) {
    return this.projectRepo.save(createProjectDto);
  }

  findAll() {
    return this.projectRepo.find();
  }

  findOne(id: string) {
    return this.projectRepo.findOne({ where: { id } });
  }

  update(id: string, updateProjectDto: UpdateProjectDto) {
    return this.projectRepo.update(id, updateProjectDto);
  }

  remove(id: string) {
    return this.projectRepo.delete(id);
  }

  findIssues(id: string) {
    return this.projectRepo.findOne({
      where: { id },
      relations: ['issues'],
      select: { issues: { issueType: true } },
    });
  }

  findMembers(id: string) {
    return this.memberShipRepo.find({
      where: { project: { id } },
      relations: { user: true },
      select: { user: { id: true, name: true, email: true, createdAt: true } },
      order: { user: { name: 'ASC' } },
    });
  }
}

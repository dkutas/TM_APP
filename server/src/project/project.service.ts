import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectService {
  constructor(@InjectRepository(Project) private repo: Repository<Project>) {}

  create(createProjectDto: CreateProjectDto) {
    return this.repo.save(createProjectDto);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  update(id: string, updateProjectDto: UpdateProjectDto) {
    return this.repo.update(id, updateProjectDto);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}

import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { ProjectMembership } from '../role/entities/role.entity';
import { FieldContextRepository } from '../repositories/field-context.repository';
import { ProjectIssueType } from './entities/projectIssueType.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(ProjectIssueType)
    private projectIssueTypeRepo: Repository<ProjectIssueType>,
    @InjectRepository(ProjectMembership)
    private memberShipRepo: Repository<ProjectMembership>,
    private fieldContextRepo: FieldContextRepository,
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
      relations: { issues: true },
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

  findMembersWithRoles(projectId: string) {
    return this.memberShipRepo.find({
      where: { project: { id: projectId } },
      relations: { user: true, role: true },
      select: {
        user: { id: true, name: true, email: true, createdAt: true },
        role: { id: true, name: true },
        project: { id: true, name: true, key: true },
      },
      order: { user: { name: 'ASC' } },
    });
  }

  findFieldsByIssueType(issueTypeId: string, projectId: string) {
    return this.fieldContextRepo.findApplicable(projectId, issueTypeId);
  }

  async assignIssueTypeToProject(projectId: string, issueTypeId: string) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
    });

    const defaultWorkflowId = '1ce06f38-3d01-4d01-93c2-278e66e044d9';

    const existing = await this.projectIssueTypeRepo.findOne({
      where: {
        project: { id: projectId },
        issueType: { id: issueTypeId },
      },
    });
    if (existing) {
      return existing;
    }

    const projectIssueType = this.projectIssueTypeRepo.create({
      project: { id: projectId },
      issueType: { id: issueTypeId },
      workflow: { id: defaultWorkflowId },
      keyPrefix: project?.key.toUpperCase(),
    });
    return this.projectIssueTypeRepo.save(projectIssueType);
  }

  findIssueTypes(id: string) {
    return this.projectRepo.findOne({
      where: { id },
      relations: { projectIssueTypes: { issueType: true } },
    });
  }
}

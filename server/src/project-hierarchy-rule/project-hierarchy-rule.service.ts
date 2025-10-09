import { Injectable } from '@nestjs/common';
import { CreateProjectHierarchyRuleDto } from './dto/create-project-hierarchy-rule.dto';
import { UpdateProjectHierarchyRuleDto } from './dto/update-project-hierarchy-rule.dto';

@Injectable()
export class ProjectHierarchyRuleService {
  create(createProjectHierarchyRuleDto: CreateProjectHierarchyRuleDto) {
    return 'This action adds a new projectHierarchyRule';
  }

  findAll() {
    return `This action returns all projectHierarchyRule`;
  }

  findOne(id: number) {
    return `This action returns a #${id} projectHierarchyRule`;
  }

  update(id: number, updateProjectHierarchyRuleDto: UpdateProjectHierarchyRuleDto) {
    return `This action updates a #${id} projectHierarchyRule`;
  }

  remove(id: number) {
    return `This action removes a #${id} projectHierarchyRule`;
  }
}

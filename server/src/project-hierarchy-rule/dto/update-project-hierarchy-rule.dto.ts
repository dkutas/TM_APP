import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectHierarchyRuleDto } from './create-project-hierarchy-rule.dto';

export class UpdateProjectHierarchyRuleDto extends PartialType(
  CreateProjectHierarchyRuleDto,
) {}

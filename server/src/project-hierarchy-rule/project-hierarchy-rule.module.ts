import { Module } from '@nestjs/common';
import { ProjectHierarchyRuleService } from './project-hierarchy-rule.service';
import { ProjectHierarchyRuleController } from './project-hierarchy-rule.controller';

@Module({
  controllers: [ProjectHierarchyRuleController],
  providers: [ProjectHierarchyRuleService],
})
export class ProjectHierarchyRuleModule {}

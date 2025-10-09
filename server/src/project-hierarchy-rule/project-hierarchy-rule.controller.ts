import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProjectHierarchyRuleService } from './project-hierarchy-rule.service';
import { CreateProjectHierarchyRuleDto } from './dto/create-project-hierarchy-rule.dto';
import { UpdateProjectHierarchyRuleDto } from './dto/update-project-hierarchy-rule.dto';

@Controller('project-hierarchy-rule')
export class ProjectHierarchyRuleController {
  constructor(private readonly projectHierarchyRuleService: ProjectHierarchyRuleService) {}

  @Post()
  create(@Body() createProjectHierarchyRuleDto: CreateProjectHierarchyRuleDto) {
    return this.projectHierarchyRuleService.create(createProjectHierarchyRuleDto);
  }

  @Get()
  findAll() {
    return this.projectHierarchyRuleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectHierarchyRuleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectHierarchyRuleDto: UpdateProjectHierarchyRuleDto) {
    return this.projectHierarchyRuleService.update(+id, updateProjectHierarchyRuleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectHierarchyRuleService.remove(+id);
  }
}

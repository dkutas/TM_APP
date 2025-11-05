import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../auth/auth.controller';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiBody({ type: CreateProjectDto })
  @ApiBearerAuth()
  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return this.projectService.create(createProjectDto);
  }

  @Get()
  findAll() {
    return this.projectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Get(':id/issues')
  findIssues(@Param('id') id: string) {
    return this.projectService.findIssues(id);
  }

  @Get(':id/members')
  findMembers(@Param('id') id: string) {
    return this.projectService.findMembers(id);
  }

  @ApiBody({ type: UpdateProjectDto })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }

  @Get(':id/issue-types')
  findIssueTypes(@Param('id') id: string) {
    return this.projectService.findIssueTypes(id);
  }

  @Get(':projectId/members-with-roles')
  findMembersWithRoles(@Param('projectId') projectId: string) {
    return this.projectService.findMembersWithRoles(projectId);
  }

  @Post(':projectId/members')
  assignMember(
    @Param('projectId') projectId: string,
    @Body() { userId }: { userId: string },
  ) {
    return this.projectService.assignMember(userId, projectId);
  }

  @Get(':projectId/assignable-users')
  findAssignableUsers(@Param('projectId') projectId: string) {
    return this.projectService.findAssignableUsers(projectId);
  }

  @Delete(':projectId/members/:userId')
  removeMember(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ) {
    return this.projectService.removeMember(userId, projectId);
  }

  @Post(':projectId/issue-type/:issueTypeId')
  assignIssueTypeToProject(
    @Param('projectId') projectId: string,
    @Param('issueTypeId') issueTypeId: string,
  ) {
    return this.projectService.assignIssueTypeToProject(projectId, issueTypeId);
  }

  @Get(':projectId/issue-type/:issueTypeId/fields')
  findFieldsByIssueType(
    @Param('issueTypeId') issueTypeId: string,
    @Param('projectId') projectId: string,
  ) {
    console.log(issueTypeId, projectId);
    return this.projectService.findFieldsByIssueType(issueTypeId, projectId);
  }
}

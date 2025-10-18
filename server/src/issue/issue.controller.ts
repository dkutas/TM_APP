import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { IssueService } from './issue.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { UserIssuesQueryDto } from './dto/user-issues-query.dto';

@Controller('issue')
export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  @Post()
  create(@Body() createIssueDto: CreateIssueDto) {
    return this.issueService.create(createIssueDto);
  }

  @Get()
  findAll() {
    return this.issueService.findAll();
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.issueService.getComments(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.issueService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIssueDto: UpdateIssueDto) {
    return this.issueService.update(id, updateIssueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.issueService.remove(id);
  }

  @Post(':id/transition')
  transition(@Param('id') id: string, @Body('statusId') toStatusId: string) {
    // Implement the logic to transition the issue to a new status
    return this.issueService.transition(id, toStatusId);
  }

  //Todo
  @Post(':id/fields')
  setValue(
    @Param('id') id: string,
    @Body() body: { fieldKey: string; value: any },
  ) {
    // const { fieldKey, value } = body;
    // // Implement the logic to set a specific field value of the issue
    // return this.issueService.update(id, fieldKey, value);
  }

  // 2) Per-user kényelmi endpoint
  @UseGuards(JwtAuthGuard)
  @Get('users/:id/issues')
  async listUserIssues(
    @Param('id') userId: string,
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: UserIssuesQueryDto,
  ) {
    return this.issueService.findByUser(userId, query);
  }

  // 2) Per-user kényelmi endpoint
  @UseGuards(JwtAuthGuard)
  @Get('project/:id/')
  async listIssuesOfProject(@Param('id') projectId: string) {
    return this.issueService.findByProject(projectId);
  }
}

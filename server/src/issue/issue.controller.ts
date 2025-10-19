import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { IssueService } from './issue.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { UserIssuesQueryDto } from './dto/user-issues-query.dto';
import {
  IssueAttachmentDto,
  IssueCommentDto,
  IssueWithFieldsDto,
} from './dto/field.dto';

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

  // @Get(':id/comments')
  // getComments(@Param('id') id: string) {
  //   return this.issueService.getComments(id);
  // }

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

  @UseGuards(JwtAuthGuard)
  @Get('users/:id/issues')
  async listUserIssues(
    @Param('id') userId: string,
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: UserIssuesQueryDto,
  ) {
    return this.issueService.findByUser(userId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('project/:id/')
  async listIssuesOfProject(@Param('id') projectId: string) {
    return this.issueService.findByProject(projectId);
  }

  @Get(':id/fields')
  getOne(@Param('id') id: string): Promise<IssueWithFieldsDto> {
    return this.issueService.getIssueWithFields(id);
  }

  @Put(':id/fields')
  upsertFields(
    @Param('id') id: string,
    @Body() body: { updates: Array<{ fieldDefId: string; value: any }> },
  ) {
    return this.issueService.upsertIssueFields(id, body?.updates ?? []);
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string): Promise<IssueCommentDto[]> {
    return this.issueService.getIssueComments(id);
  }

  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Body() body: { authorId: string; body: string },
  ) {
    return this.issueService.addIssueComment(id, body.authorId, body.body);
  }

  @Patch('comments/:commentId')
  editComment(
    @Param('commentId') commentId: string,
    @Body() body: { authorId: string; body: string },
  ) {
    return this.issueService.editIssueComment(
      commentId,
      body.authorId,
      body.body,
    );
  }

  @Delete('comments/:commentId')
  deleteComment(
    @Param('commentId') commentId: string,
    @Body() body: { authorId: string },
  ) {
    return this.issueService.deleteIssueComment(commentId, body.authorId);
  }

  // // ---------------- HISTORY --------------
  // @Get(':id/history')
  // getHistory(@Param('id') id: string): Promise<IssueHistoryItemDto[]> {
  //   return this.issueService.getIssueHistory(id);
  // }

  // ------------- ATTACHMENTS -------------
  @Get(':id/attachments')
  getAttachments(@Param('id') id: string): Promise<IssueAttachmentDto[]> {
    return this.issueService.getIssueAttachments(id);
  }

  @Post(':id/attachments')
  addAttachment(
    @Param('id') id: string,
    @Body()
    body: {
      uploadedBy: string;
      fileName: string;
      mimeType: string;
      size: number;
      storageKey: string;
    },
  ) {
    return this.issueService.addIssueAttachment(id, body.uploadedBy, {
      fileName: body.fileName,
      mimeType: body.mimeType,
      size: body.size,
      storageKey: body.storageKey,
    });
  }

  // @Delete('attachments/:attachmentId')
  // deleteAttachment(
  //   @Param('attachmentId') attachmentId: string,
  //   @Body() body: { userId: string },
  // ) {
  //   return this.issueService.deleteIssueAttachment(attachmentId, body.userId);
  // }
}

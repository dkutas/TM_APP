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
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { IssueService } from './issue.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { UserIssuesQueryDto } from './dto/user-issues-query.dto';
import {
  FieldDefsDTO,
  IssueAttachmentDto,
  IssueCommentDto,
  IssueTransitionDto,
  IssueWithFieldsDto,
} from './dto/field.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../auth/auth.controller';

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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.issueService.remove(id);
  }

  @Post(':id/transition')
  transition(
    @Param('id') id: string,
    @Body('transitionId') transitionId: string,
  ) {
    // Implement the logic to transition the issue to a new status
    return this.issueService.transition(id, transitionId);
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
  upsertFields(@Param('id') id: string, @Body() body: UpdateIssueDto) {
    return this.issueService.upsertIssueFields(
      id,
      body.updates,
      body.systemUpdates,
    );
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string): Promise<IssueCommentDto[]> {
    return this.issueService.getIssueComments(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Body() body: { body: string },
    @Req() req: AuthenticatedRequest,
  ) {
    return this.issueService.addIssueComment(id, req.user.id, body.body);
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

  @Get(':id/field-definitions')
  getFieldDefinitions(@Param('id') id: string): Promise<FieldDefsDTO[]> {
    return this.issueService.getIssueFieldDefinitions(id);
  }

  @Get(':id/transitions')
  getAvailableTransitions(
    @Param('id') id: string,
  ): Promise<IssueTransitionDto[]> {
    return this.issueService.getAvailableTransitions(id);
  }

  // @Delete('attachments/:attachmentId')
  // deleteAttachment(
  //   @Param('attachmentId') attachmentId: string,
  //   @Body() body: { userId: string },
  // ) {
  //   return this.issueService.deleteIssueAttachment(attachmentId, body.userId);
  // }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
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
import { FilesInterceptor } from '@nestjs/platform-express';
import { join } from 'path';
import { AttachmentService } from '../attachment/attachment.service';
import { AttachFileDto } from '../attachment/dto/attach-file.dto';
import { diskStorage } from 'multer';
import { ChangeLogRepository } from '../change-log/change-log.repository';

@Controller('issue')
export class IssueController {
  constructor(
    private readonly issueService: IssueService,
    private readonly attachmentService: AttachmentService,
    private readonly historyRepo: ChangeLogRepository,
  ) {}

  @Post()
  create(@Body() createIssueDto: CreateIssueDto) {
    const { projectId, issueTypeId, ...rest } = createIssueDto;
    return this.issueService.createIssue(projectId, issueTypeId, rest);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.issueService.findAll(pageNum, limitNum);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/transition')
  transition(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body('transitionId') transitionId: string,
  ) {
    return this.issueService.transition(id, transitionId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('search')
  async listUserIssues(
    @Req() req: AuthenticatedRequest,
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: UserIssuesQueryDto,
  ) {
    return this.issueService.search(query.userId || req.user.id, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.issueService.findOne(id);
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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id/fields')
  upsertFields(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: UpdateIssueDto,
  ) {
    return this.issueService.upsertIssueFields(
      id,
      body.updates,
      body.systemUpdates,
      req.user.id,
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

  @Get(':id/attachments')
  getAttachments(@Param('id') id: string): Promise<IssueAttachmentDto[]> {
    return this.issueService.getIssueAttachments(id);
  }

  @Get(':id/field-definitions')
  getFieldDefinitions(@Param('id') id: string): Promise<FieldDefsDTO[]> {
    return this.issueService.getIssueFieldDefinitions(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':issueId/attachments')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        destination: async (req, _file, cb) => {
          const issueId = req.params.issueId;
          if (!issueId) {
            return cb(new Error('Issue ID is required in the URL'), '');
          }
          const dest = join(process.cwd(), 'uploads', 'issues', issueId);
          try {
            await import('fs/promises').then((fsPromises) => {
              fsPromises
                .mkdir(dest, { recursive: true })
                .then(() => {
                  cb(null, dest);
                })
                .catch((err) => {
                  cb(err, '');
                });
            });
          } catch (e) {
            cb(new Error('Failed to create directory'), '');
          }
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = file.originalname.split('.').pop();
          cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async upload(
    @Param('issueId', new ParseUUIDPipe()) issueId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: AttachFileDto,
  ) {
    const uploaderId = req.user.id;
    const stored = files.map((f) => ({
      originalName: f.originalname,
      mimeType: f.mimetype,
      size: f.size,
      relativeUrl: `/files/issues/${issueId}/${f.filename}`,
    }));
    for (const f of files) {
      await this.historyRepo.add({
        issueId: issueId,
        actorId: uploaderId,
        items: [
          {
            fieldKey: 'Attachment',
            from: '(added files)',
            to: f.originalname,
          },
        ],
      });
    }

    return this.attachmentService.createForIssue({
      issueId,
      uploaderId,
      storedFiles: stored,
    });
  }

  @Delete('attachments/:attachmentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteAttachment(
    @Param('attachmentId', new ParseUUIDPipe()) attachmentId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const attachmentToDelete =
      await this.attachmentService.findOne(attachmentId);

    if (!attachmentToDelete) {
      throw new Error('Attachment not found');
    }

    await this.historyRepo.add({
      issueId: attachmentToDelete.issue.id,
      actorId: req.user.id,
      items: [
        {
          fieldKey: 'Attachment',
          from: attachmentToDelete.fileName,
          to: '(removed)',
        },
      ],
    });
    return this.attachmentService.remove(attachmentId);
  }

  @Get(':id/transitions')
  getAvailableTransitions(
    @Param('id') id: string,
  ): Promise<IssueTransitionDto[]> {
    return this.issueService.getAvailableTransitions(id);
  }
}

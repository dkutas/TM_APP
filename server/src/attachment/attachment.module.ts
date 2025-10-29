import { Module } from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { AttachmentController } from './attachment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from './entities/attachment.entity';
import { Issue } from '../issue/entities/issue.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attachment, Issue, User])],
  controllers: [AttachmentController],
  providers: [AttachmentService],
})
export class AttachmentModule {}

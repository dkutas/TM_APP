import { Module } from '@nestjs/common';
import { ChangeLogService } from './change-log.service';
import { ChangeLogController } from './change-log.controller';

@Module({
  controllers: [ChangeLogController],
  providers: [ChangeLogService],
})
export class ChangeLogModule {}

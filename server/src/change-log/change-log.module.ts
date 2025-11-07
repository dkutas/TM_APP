import { Module } from '@nestjs/common';
import { ChangeLogService } from './change-log.service';
import { ChangeLogController } from './change-log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChangeLog } from './entities/change-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChangeLog])],
  controllers: [ChangeLogController],
  providers: [ChangeLogService],
})
export class ChangeLogModule {}

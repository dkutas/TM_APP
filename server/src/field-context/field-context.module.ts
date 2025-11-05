import { Module } from '@nestjs/common';
import { FieldContextService } from './field-context.service';
import { FieldContextController } from './field-context.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldContext } from './entities/field-context.entity';
import { IssueFieldValue } from '../issue-field-value/entities/issue-field-value.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FieldContext, IssueFieldValue])],
  controllers: [FieldContextController],
  providers: [FieldContextService],
})
export class FieldContextModule {}

import { Module } from '@nestjs/common';
import { FieldContextService } from './field-context.service';
import { FieldContextController } from './field-context.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldContext } from './entities/field-context.entity';
import { IssueFieldValue } from '../issue-field-value/entities/issue-field-value.entity';
import { FieldOption } from '../field-option/entities/field-option.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldContext, IssueFieldValue, FieldOption]),
  ],
  controllers: [FieldContextController],
  providers: [FieldContextService],
})
export class FieldContextModule {}

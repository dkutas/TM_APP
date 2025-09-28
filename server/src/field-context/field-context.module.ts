import { Module } from '@nestjs/common';
import { FieldContextService } from './field-context.service';
import { FieldContextController } from './field-context.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldContext } from './entities/field-context.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FieldContext])],
  controllers: [FieldContextController],
  providers: [FieldContextService],
})
export class FieldContextModule {}

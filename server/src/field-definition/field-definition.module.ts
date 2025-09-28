import { Module } from '@nestjs/common';
import { FieldDefinitionService } from './field-definition.service';
import { FieldDefinitionController } from './field-definition.controller';
import { FieldDefinition } from './entities/field-definition.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([FieldDefinition])],
  controllers: [FieldDefinitionController],
  providers: [FieldDefinitionService],
})
export class FieldDefinitionModule {}

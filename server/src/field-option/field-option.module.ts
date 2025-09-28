import { Module } from '@nestjs/common';
import { FieldOptionService } from './field-option.service';
import { FieldOptionController } from './field-option.controller';
import { FieldOption } from './entities/field-option.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([FieldOption])],
  controllers: [FieldOptionController],
  providers: [FieldOptionService],
})
export class FieldOptionModule {}

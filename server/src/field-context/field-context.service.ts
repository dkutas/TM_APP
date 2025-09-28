import { Injectable } from '@nestjs/common';
import { CreateFieldContextDto } from './dto/create-field-context.dto';
import { UpdateFieldContextDto } from './dto/update-field-context.dto';
import { FieldContext } from './entities/field-context.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FieldContextService {
  constructor(
    @InjectRepository(FieldContext)
    private readonly fieldContextRepository: Repository<FieldContext>,
  ) {}

  create(createFieldContextDto: CreateFieldContextDto) {
    return this.fieldContextRepository.create(createFieldContextDto);
  }

  findAll() {
    return this.fieldContextRepository.find();
  }

  findOne(id: string) {
    return this.fieldContextRepository.findOne({ where: { id } });
  }

  update(id: string, updateFieldContextDto: UpdateFieldContextDto) {
    return this.fieldContextRepository.update(id, updateFieldContextDto);
  }

  remove(id: string) {
    return this.fieldContextRepository.delete(id);
  }
}

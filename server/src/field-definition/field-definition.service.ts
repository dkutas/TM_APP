import { Injectable } from '@nestjs/common';
import { CreateFieldDefinitionDto } from './dto/create-field-definition.dto';
import { UpdateFieldDefinitionDto } from './dto/update-field-definition.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FieldDefinition } from './entities/field-definition.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FieldDefinitionService {
  constructor(
    @InjectRepository(FieldDefinition)
    private fieldsRepository: Repository<FieldDefinition>,
  ) {}

  create(createFieldDefinitionDto: CreateFieldDefinitionDto) {
    return this.fieldsRepository.create(createFieldDefinitionDto);
  }

  findAll() {
    return this.fieldsRepository.find();
  }

  findOne(id: string) {
    return this.fieldsRepository.findOne({ where: { id } });
  }

  update(id: string, updateFieldDefinitionDto: UpdateFieldDefinitionDto) {
    return this.fieldsRepository.update(id, updateFieldDefinitionDto);
  }

  remove(id: string) {
    return this.fieldsRepository.delete(id);
  }
}

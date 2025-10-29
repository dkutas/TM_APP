import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateFieldDefinitionDto } from './dto/create-field-definition.dto';
import { UpdateFieldDefinitionDto } from './dto/update-field-definition.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FieldDefinition } from './entities/field-definition.entity';
import { Repository } from 'typeorm';
import { FieldScope } from '../common/enums';

@Injectable()
export class FieldDefinitionService {
  constructor(
    @InjectRepository(FieldDefinition)
    private fieldsRepository: Repository<FieldDefinition>,
  ) {}

  create(createFieldDefinitionDto: CreateFieldDefinitionDto) {
    return this.fieldsRepository.save(
      this.fieldsRepository.create({
        ...createFieldDefinitionDto,
        key: `custom.${createFieldDefinitionDto.name.toLowerCase().split(' ').join('_')}`,
        isSystem: false,
        scope: FieldScope.CUSTOM,
      }),
    );
  }

  findAll() {
    return this.fieldsRepository.find({ order: { name: 1 } });
  }

  findOne(id: string) {
    return this.fieldsRepository.findOne({ where: { id } });
  }

  findAllWithContexts() {
    return this.fieldsRepository.find({
      relations: { contexts: { project: true, issueType: true } },
    });
  }

  findOneWithContexts(id: string) {
    return this.fieldsRepository.findOne({
      where: { id },
      relations: { contexts: { project: true, issueType: true } },
    });
  }

  async update(id: string, updateFieldDefinitionDto: UpdateFieldDefinitionDto) {
    const existingField = await this.fieldsRepository.findOne({
      where: { id },
    });
    if (!existingField) {
      throw new HttpException(
        `No FieldDefinition exist with ID: ${id}`,
        HttpStatus.NOT_ACCEPTABLE,
      );
    }
    return this.fieldsRepository.update(id, {
      ...updateFieldDefinitionDto,
      key: updateFieldDefinitionDto.name
        ? `custom.${updateFieldDefinitionDto.name.toLowerCase().split(' ').join('_')}`
        : existingField.key,
      isSystem: false,
      scope: FieldScope.CUSTOM,
    });
  }
}

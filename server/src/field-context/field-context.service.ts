import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFieldContextDto } from './dto/create-field-context.dto';
import { UpdateFieldContextDto } from './dto/update-field-context.dto';
import { FieldContext } from './entities/field-context.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IssueFieldValue } from '../issue-field-value/entities/issue-field-value.entity';

@Injectable()
export class FieldContextService {
  constructor(
    @InjectRepository(FieldContext)
    private readonly fieldContextRepository: Repository<FieldContext>,
    @InjectRepository(IssueFieldValue)
    private readonly issueFieldValueRepository: Repository<IssueFieldValue>,
  ) {}

  create(createFieldContextDto: CreateFieldContextDto) {
    const qb = this.fieldContextRepository.createQueryBuilder();
    return qb
      .insert()
      .into(FieldContext)
      .values({
        fieldDef: { id: createFieldContextDto.fieldDefId },
        project: { id: createFieldContextDto.projectId },
        issueType: { id: createFieldContextDto.issueTypeId },
        defaultOption: { id: createFieldContextDto.defaultOption?.id },
        defaultValue: createFieldContextDto.defaultValue,
        min: createFieldContextDto.min,
        max: createFieldContextDto.max,
        regex: createFieldContextDto.regex,
        required: createFieldContextDto.required,
      })
      .execute();
  }

  findAll() {
    return this.fieldContextRepository.find();
  }

  findOne(id: string) {
    return this.fieldContextRepository.findOne({
      where: { id },
      relations: {
        fieldDef: true,
        defaultOption: true,
        options: true,
      },
      order: { options: { order: 'ASC' } },
    });
  }

  findByProjectAndIssueType(projectId: string, issueTypeId: string) {
    return this.fieldContextRepository.find({
      where: { project: { id: projectId }, issueType: { id: issueTypeId } },
      relations: { fieldDef: true },
    });
  }

  update(id: string, updateFieldContextDto: UpdateFieldContextDto) {
    return this.fieldContextRepository.update(id, updateFieldContextDto);
  }

  async findOptionsByFieldCtxId(fieldCtxId: string) {
    const ctx = await this.fieldContextRepository.findOne({
      where: { id: fieldCtxId },
      relations: { options: true },
      order: { options: { order: 'ASC' } },
    });
    if (!ctx) {
      throw new BadRequestException(
        `Field Context with ID ${fieldCtxId} not found`,
      );
    }
    return ctx.options;
  }

  async remove(id: string) {
    const issueFieldDefinition = await this.fieldContextRepository.findOne({
      where: { id },
      relations: { fieldDef: true },
    });

    if (!issueFieldDefinition) {
      throw new Error(`Field Context with ID ${id} not found`);
    }

    const issueFieldValues = await this.issueFieldValueRepository.find({
      where: { fieldDef: { id: issueFieldDefinition.fieldDef.id } },
    });

    for (const issueFieldValue of issueFieldValues) {
      await this.issueFieldValueRepository.delete(issueFieldValue.id);
    }

    return this.fieldContextRepository.delete(id);
  }
}

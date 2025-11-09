import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateFieldContextDto } from './dto/create-field-context.dto';
import { UpdateFieldContextDto } from './dto/update-field-context.dto';
import { FieldContext } from './entities/field-context.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IssueFieldValue } from '../issue-field-value/entities/issue-field-value.entity';
import { FieldOption } from '../field-option/entities/field-option.entity';

@Injectable()
export class FieldContextService {
  constructor(
    @InjectRepository(FieldContext)
    private readonly fieldContextRepository: Repository<FieldContext>,
    @InjectRepository(IssueFieldValue)
    private readonly issueFieldValueRepository: Repository<IssueFieldValue>,
    @InjectRepository(FieldOption)
    private readonly fieldOptionRepository: Repository<FieldOption>,
  ) {}

  async create(createFieldContextDto: CreateFieldContextDto) {
    const fieldContext = this.fieldContextRepository.create({
      id: randomUUID(),
      fieldDef: { id: createFieldContextDto.fieldDefId },
      project: { id: createFieldContextDto.projectId },
      issueType: { id: createFieldContextDto.issueTypeId },
    });
    const context = await this.fieldContextRepository.save(fieldContext);
    for (const option of fieldContext.options || []) {
      const newOption = this.fieldOptionRepository.create({
        ...option,
        fieldCtx: { id: fieldContext.id },
      });
      await this.fieldOptionRepository.save(newOption);
    }
    return context;
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

  async update(id: string, updateFieldContextDto: UpdateFieldContextDto) {
    const existingContext = await this.fieldContextRepository.findOne({
      where: { id },
    });
    if (!existingContext) {
      throw new BadRequestException(`Field Context with ID ${id} not found`);
    }
    const updatedContext = Object.assign(
      existingContext,
      updateFieldContextDto,
    );
    for (const option of updatedContext.options || []) {
      if (option.id) {
        await this.fieldOptionRepository.update(option.id, option);
      } else {
        const newOption = this.fieldOptionRepository.create({
          ...option,
          fieldCtx: { id: updatedContext.id },
        });
        await this.fieldOptionRepository.save(newOption);
      }
    }
    return this.fieldContextRepository.save(updatedContext);
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

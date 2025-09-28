import { Injectable } from '@nestjs/common';
import { CreateFieldOptionDto } from './dto/create-field-option.dto';
import { UpdateFieldOptionDto } from './dto/update-field-option.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FieldOption } from './entities/field-option.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FieldOptionService {
  constructor(
    @InjectRepository(FieldOption)
    private fieldOptionRepository: Repository<FieldOption>,
  ) {}

  create(createFieldOptionDto: CreateFieldOptionDto) {
    return this.fieldOptionRepository.save(createFieldOptionDto);
  }

  findAll() {
    return this.fieldOptionRepository.find();
  }

  findOne(id: string) {
    return this.fieldOptionRepository.findOne({ where: { id } });
  }

  update(id: string, updateFieldOptionDto: UpdateFieldOptionDto) {
    return this.fieldOptionRepository.update(id, updateFieldOptionDto);
  }

  remove(id: string) {
    return this.fieldOptionRepository.delete(id);
  }
}

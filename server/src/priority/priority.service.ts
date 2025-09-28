import { Injectable } from '@nestjs/common';
import { CreatePriorityDto } from './dto/create-priority.dto';
import { UpdatePriorityDto } from './dto/update-priority.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Priority } from './entities/priority.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PriorityService {
  constructor(
    @InjectRepository(Priority)
    private priorityRepository: Repository<Priority>,
  ) {}

  create(createPriorityDto: CreatePriorityDto) {
    return this.priorityRepository.create(createPriorityDto);
  }

  findAll() {
    return this.priorityRepository.find();
  }

  findOne(id: string) {
    return this.priorityRepository.findOne({ where: { id } });
  }

  update(id: string, updatePriorityDto: UpdatePriorityDto) {
    return this.priorityRepository.update(id, updatePriorityDto);
  }

  remove(id: string) {
    return this.priorityRepository.delete(id);
  }
}

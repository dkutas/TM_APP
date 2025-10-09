import { Injectable } from '@nestjs/common';
import { CreateChangeLogDto } from './dto/create-change-log.dto';
import { UpdateChangeLogDto } from './dto/update-change-log.dto';

@Injectable()
export class ChangeLogService {
  create(createChangeLogDto: CreateChangeLogDto) {
    return 'This action adds a new changeLog';
  }

  findAll() {
    return `This action returns all changeLog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} changeLog`;
  }

  update(id: number, updateChangeLogDto: UpdateChangeLogDto) {
    return `This action updates a #${id} changeLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} changeLog`;
  }
}

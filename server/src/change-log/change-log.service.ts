import { Injectable, Logger } from '@nestjs/common';
import { CreateChangeLogDto } from './dto/create-change-log.dto';
import { UpdateChangeLogDto } from './dto/update-change-log.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChangeLog } from './entities/change-log.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChangeLogService {
  private readonly logger = new Logger(ChangeLogService.name);

  constructor(
    @InjectRepository(ChangeLog)
    private changeLogRepository: Repository<ChangeLog>,
  ) {}

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

  getChangeLogsForIssue(issueId: string) {
    this.logger.log(`Getting change logs for issue ${issueId}`);
    return this.changeLogRepository.find({
      where: { issue: { id: issueId } },
      relations: { actor: true, items: true },
      order: { createdAt: 'DESC' },
    });
  }

  getLastTenEntriesForUser(userId: string) {
    this.logger.log(`Getting last ten entries for user ${userId}`);
    return this.changeLogRepository.find({
      where: { actor: { id: userId } },
      relations: { items: true, issue: true },
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} changeLog`;
  }
}

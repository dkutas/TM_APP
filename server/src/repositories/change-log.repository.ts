// repositories/change-log.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import {
  ChangeItem,
  ChangeLog,
} from '../change-log/entities/change-log.entity';

@Injectable()
export class ChangeLogRepository extends Repository<ChangeLog> {
  constructor(ds: DataSource) {
    super(ChangeLog, ds.createEntityManager());
  }

  findByIssue(issueId: string) {
    return this.createQueryBuilder('h')
      .leftJoinAndSelect('h.issue', 'i')
      .leftJoinAndSelect('h.actor', 'a')
      .leftJoinAndSelect('h.items', 'it')
      .where('i.id = :issueId', { issueId })
      .orderBy('h.createdAt', 'DESC')
      .getMany();
  }

  async add(params: {
    issueId: string;
    actorId: string;
    items: Array<{
      fieldKey: string;
      from?: string | null;
      to?: string | null;
    }>;
  }) {
    const { issueId, actorId, items } = params;

    const changeLog = this.create({
      issue: { id: issueId },
      actor: { id: actorId },
      items: items
        .filter((it) => it.to && it.from && it.from !== it.to)
        .map((it) => {
          return this.manager.create(ChangeItem, {
            fieldKey: it.fieldKey,
            fromDisplay: it.from ?? null,
            toDisplay: it.to ?? null,
          } as ChangeItem);
        }),
    });
    return this.save(changeLog);
  }
}

// repositories/change-log.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ChangeLog } from '../change-log/entities/change-log.entity';

@Injectable()
export class ChangeLogRepository extends Repository<ChangeLog> {
  constructor(ds: DataSource) {
    super(ChangeLog, ds.createEntityManager());
  }

  findByIssue(issueId: string) {
    return this.createQueryBuilder('h')
      .leftJoin('h.issue', 'i')
      .where('i.id = :issueId', { issueId })
      .getMany();
  }

  add(params: {
    issueId: string;
    actorId: string;
    items: Array<{
      fieldKey: string;
      from?: string | null;
      to?: string | null;
    }>;
  }) {
    const { issueId, actorId, items } = params;
    return this.save(
      this.create({
        issue: { id: issueId },
        actor: { id: actorId },
        items: items.map((it) => ({
          fieldKey: it.fieldKey,
          from: it.from ?? null,
          to: it.to ?? null,
        })),
      }),
    );
  }
}

// repositories/issue-link.repository.ts
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { IssueLink } from '../link-type/entities/issue-link.entity';

@Injectable()
export class IssueLinkRepository extends Repository<IssueLink> {
  constructor(ds: DataSource) {
    super(IssueLink, ds.createEntityManager());
  }

  // mindkét irány, join-olva a linkType-ot és a másik issue core adatait
  async findByIssue(issueId: string) {
    const out = await this.createQueryBuilder('l')
      .leftJoinAndSelect('l.linkType', 'lt')
      .leftJoin('l.srcIssue', 'src')
      .leftJoinAndSelect('l.dstIssue', 'tgt')
      .leftJoinAndSelect('tgt.status', 'tgtst')
      .where('src.id = :issueId', { issueId })
      .getMany();

    const inn = await this.createQueryBuilder('l')
      .leftJoinAndSelect('l.linkType', 'lt')
      .leftJoinAndSelect('l.srcIssue', 'src')
      .leftJoin('l.dstIssue', 'tgt')
      .leftJoinAndSelect('src.status', 'srcst')
      .where('tgt.id = :issueId', { issueId })
      .getMany();

    return { out, inn };
  }

  async createLink(sourceId: string, targetId: string, linkTypeId: string) {
    return this.save(
      this.create({
        srcIssue: { id: sourceId },
        dstIssue: { id: targetId },
        linkType: { id: linkTypeId },
      }),
    );
  }

  async deleteLink(linkId: string) {
    await this.delete(linkId);
  }
}

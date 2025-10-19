// repositories/issue-field-value.repository.ts
import { DataSource, Repository } from 'typeorm';
import { IssueFieldValue } from '../issue-field-value/entities/issue-field-value.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IssueFieldValueRepository extends Repository<IssueFieldValue> {
  constructor(ds: DataSource) {
    super(IssueFieldValue, ds.createEntityManager());
  }

  // Minden érték + fieldDef + multi opciók (és bennük a FieldOption) egyben
  async findByIssueWithJoins(issueId: string) {
    // Betölti az összes IssueFieldValue-t az adott issue-hoz, a kapcsolt fieldDef-et,
    // valamint minden option típusú értékhez a kapcsolt FieldOption entitást is.
    return this.createQueryBuilder('v')
      .leftJoinAndSelect('v.fieldDef', 'fd')
      .leftJoinAndSelect('v.options', 'vopt')
      .leftJoinAndSelect('vopt.option', 'opt')
      .leftJoin('v.issue', 'iss')
      .where('iss.id = :issueId', { issueId })
      .orderBy('fd.name', 'ASC')
      .addOrderBy('vopt.id', 'ASC')
      .getMany();
  }

  // Egy konkrét fieldhez az érték (ha van)
  findOneByIssueAndFieldDef(issueId: string, fieldDefId: string) {
    return this.createQueryBuilder('v')
      .leftJoin('v.issue', 'iss')
      .leftJoin('v.fieldDef', 'fd')
      .where('iss.id = :issueId', { issueId })
      .andWhere('fd.id = :fieldDefId', { fieldDefId })
      .leftJoinAndSelect('v.options', 'vopt')
      .leftJoinAndSelect('vopt.option', 'opt')
      .getOne();
  }
}

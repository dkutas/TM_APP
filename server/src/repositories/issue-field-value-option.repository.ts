import {
  IssueFieldValue,
  IssueFieldValueOption,
} from '../issue-field-value/entities/issue-field-value.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class IssueFieldValueOptionRepository extends Repository<IssueFieldValueOption> {
  constructor(ds: DataSource) {
    super(IssueFieldValueOption, ds.createEntityManager());
  }

  async replaceForValue(issueFieldValue: IssueFieldValue, optionIds: string[]) {
    await this.createQueryBuilder()
      .delete()
      .where('issueFieldValueId = :id', { id: issueFieldValue.id })
      .execute();

    if (optionIds?.length) {
      await this.insert(
        optionIds.map((id) => ({
          issueFieldValue: { id: issueFieldValue.id },
          option: { id },
        })),
      );
    }
  }
}

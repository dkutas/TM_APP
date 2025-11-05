// repositories/field-context.repository.ts
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { FieldContext } from '../field-context/entities/field-context.entity';

@Injectable()
export class FieldContextRepository extends Repository<FieldContext> {
  constructor(ds: DataSource) {
    super(FieldContext, ds.createEntityManager());
  }

  async findApplicable(projectId: string, issueTypeId: string) {
    // visible = true, és (project null|=) & (issueType null|=)

    console.log('repo', projectId, issueTypeId);
    return this.createQueryBuilder('fc')
      .innerJoinAndSelect('fc.fieldDef', 'fd')
      .leftJoinAndSelect('fd.options', 'opt')
      .leftJoinAndSelect('fc.defaultOption', 'defopt')
      .andWhere('(fc.project_id IS NULL OR fc.project_id = :p)', {
        p: projectId,
      })
      .andWhere('(fc.issue_type_id IS NULL OR fc.issue_type_id = :it)', {
        it: issueTypeId,
      })
      .addOrderBy('fd.key', 'ASC')
      .getMany();
  }
}

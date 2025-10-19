import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Issue } from './entities/issue.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserIssueRole, UserIssuesQueryDto } from './dto/user-issues-query.dto';
import { IssueRepository } from '../repositories/issue.repository';
import { FieldContextRepository } from '../repositories/field-context.repository';
import { IssueFieldValueRepository } from '../repositories/issue-field-value.repository';
import { FieldDefinition } from '../field-definition/entities/field-definition.entity';
import {
  FieldDto,
  IssueAttachmentDto,
  IssueCommentDto,
  IssueLinkDto,
  IssueWithFieldsDto,
} from './dto/field.dto';
import {
  IssueFieldValue,
  IssueFieldValueOption,
} from '../issue-field-value/entities/issue-field-value.entity';
import { DataType } from '../common/enums';
import { AttachmentRepository } from '../repositories/attachment.repository';
import { IssueLinkRepository } from '../repositories/issue-link.repository';
import { CommentRepository } from '../repositories/comment.repository';
import { ChangeLogRepository } from '../repositories/change-log.repository';

type OptionJson = { optionId: string };
type LinkJson = { issueId: string; linkTypeId: string };

const isOptionJson = (x: unknown): x is OptionJson =>
  typeof x === 'object' &&
  x !== null &&
  typeof (x as any).optionId === 'string';

const isLinkJson = (x: unknown): x is LinkJson =>
  typeof x === 'object' &&
  x !== null &&
  typeof (x as any).issueId === 'string' &&
  typeof (x as any).linkTypeId === 'string';

const toStringOrNull = (x: unknown): string | null =>
  x == null ? null : typeof x === 'string' ? x : String(x);

const toBoolOrNull = (x: unknown): boolean | null => {
  if (typeof x === 'boolean') return x;
  if (typeof x === 'string') {
    const s = x.trim().toLowerCase();
    if (s === 'true') return true;
    if (s === 'false') return false;
  }
  return null;
};

const isISODate = (x: unknown): x is string =>
  typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x);

const toDateOrNull = (x: unknown): Date | null => {
  if (x instanceof Date) return x;
  if (typeof x === 'string') {
    const t = Date.parse(x);
    return Number.isNaN(t) ? null : new Date(t);
  }
  return null;
};

const isUUID = (x: unknown): x is string =>
  typeof x === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    x,
  );

type SortSpec = { [prop: string]: 'ASC' | 'DESC' };

@Injectable()
export class IssueService {
  constructor(
    @InjectRepository(Issue)
    private readonly issueRepository: Repository<Issue>,
    private readonly ds: DataSource,
    private readonly issues: IssueRepository,
    private readonly fieldCtxRepo: FieldContextRepository,
    private readonly valueRepo: IssueFieldValueRepository,
    private readonly linkRepo: IssueLinkRepository,
    private readonly commentRepo: CommentRepository,
    private readonly historyRepo: ChangeLogRepository,
    private readonly attachRepo: AttachmentRepository,
  ) {}

  create(createIssueDto: CreateIssueDto) {
    return this.issueRepository.create(createIssueDto);
  }

  findAll() {
    return this.issueRepository.find({
      relations: [
        'status',
        'assignee',
        'reporter',
        'project',
        'priority',
        'issueType',
      ],
    });
  }

  findOne(id: string) {
    return this.issueRepository.findOne({
      where: { id },
      relations: ['status', 'assignee', 'reporter', 'project', 'priority'],
    });
  }

  update(id: string, updateIssueDto: UpdateIssueDto) {
    return this.issueRepository.update(id, updateIssueDto);
  }

  remove(id: string) {
    return this.issueRepository.delete(id);
  }

  transition(id: string, statusId: string) {
    // Implement the logic to transition the issue to a new status
    return this.issueRepository.update(id, { status: { id: statusId } });
  }

  getComments(id: string) {
    return this.issueRepository.find({
      where: { id: id },
      relations: ['comments'],
    });
  }

  async findByProject(projectId: string) {
    return this.issueRepository.find({
      where: { project: { id: projectId } },
      relations: [
        'status',
        'assignee',
        'reporter',
        'project',
        'priority',
        'issueType',
      ],
    });
  }

  async getIssueWithFields(issueId: string): Promise<IssueWithFieldsDto> {
    const issue = await this.issues.findOneWithCore(issueId);
    if (!issue) throw new NotFoundException('Issue not found');

    const projectId = issue.project.id;
    const issueTypeId = issue.issueType.id;

    const contexts = await this.fieldCtxRepo.findApplicable(
      projectId,
      issueTypeId,
    );

    // ---- load extras in parallel ----
    const [links, comments, attachments, historyLogs, basic] =
      await Promise.all([
        this.getIssueLinks(issueId),
        this.getIssueComments(issueId),
        this.getIssueAttachments(issueId),
        this.historyRepo.findByIssue(issueId),
        this.findOne(issueId),
      ]);

    // flatten change-log items to IssueHistoryItemDto[]
    // const history: IssueHistoryItemDto[] = historyLogs.flatMap((h) =>
    //   (h.items ?? []).map((it) => ({
    //     id: it.id,
    //     authorId: h.actor.id,
    //     changedAt: h.changedAt.toISOString(),
    //     field: it.field ?? (it as any).fieldKey ?? '',
    //     from: it.from ?? null,
    //     to: it.to ?? null,
    //   })),
    // );

    // meglévő értékek az issue-hoz (fieldDef + options + option)
    const values = await this.valueRepo.findByIssueWithJoins(issueId);
    const valueByFd = new Map(values.map((v) => [v.fieldDef.id, v]));

    const fields: FieldDto[] = contexts.map((ctx) => {
      const fd = ctx.fieldDef;
      const dataType = fd.dataType;
      const v = valueByFd.get(fd.id);

      const options = fd.options?.length
        ? fd.options
            .slice()
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((o) => ({
              id: o.id,
              key: o.key,
              value: o.value,
              order: o.order ?? 0,
            }))
        : null;

      let value: any = null;
      switch (dataType) {
        case DataType.TEXT:
          value = v?.valueText ?? null;
          break;
        case DataType.NUMBER: // valueNumber string (decimal) → FE-nek number (ha egész/szabályozott)
          value = v?.valueNumber != null ? Number(v.valueNumber) : null;
          break;
        case DataType.BOOL:
          value = v?.valueBool ?? null;
          break;
        case DataType.DATE:
          value = v?.valueDate ?? null;
          break;
        case DataType.DATETIME:
          value = v?.valueDatetime ?? null;
          break;
        case DataType.USER:
          value = v?.valueUserId ?? null;
          break;
        case DataType.OPTION: {
          const json = v?.valueJson as unknown;
          value = isOptionJson(json)
            ? json.optionId
            : (ctx.defaultOption?.id ?? null);
          break;
        }
        case DataType.MULTI_OPTION:
          // a v.options elemei IssueFieldValueOption-ok, bennük eager `option`
          value = v?.options?.map((o) => o.option.id) ?? [];
          break;
        case DataType.LINK: {
          const json = v?.valueJson as unknown;
          value = isLinkJson(json) ? json : null;
          break;
        }
        default: {
          // Unknown/other JSON payloads: pass through as-is or null
          const json = v?.valueJson as unknown;
          value = json ?? null;
          break;
        }
      }

      return {
        id: fd.id,
        key: fd.key,
        name: fd.name,
        dataType: fd.dataType,
        required: ctx.required,
        visible: ctx.visible,
        editable: ctx.editable,
        order: ctx.order,
        options,
        value,
      };
    });

    return {
      id: issue.id,
      key: issue.key,
      summary: issue.summary,
      description: issue.description ?? null,
      project: issue.project,
      projectIssueType: issue.projectIssueType,
      issueType: issue.issueType,
      status: issue.status,
      reporter: issue.reporter,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      projectId,
      issueTypeId,
      links,
      comments,
      attachments,
      // history,
      fields,
      ...basic,
    };
  }

  // ---------- UPSERT ------------------------------------------------------

  /**
   * updates: [{ fieldDefId, value }]
   *
   * - MULTI_OPTION: kapcsolótábla csere (IssueFieldValueOption)
   * - OPTION: valueJson = { optionId }
   * - NUMBER: az entitásban string (decimal) → DB-be stringet írunk
   */
  async upsertIssueFields(
    issueId: string,
    updates: Array<{ fieldDefId: string; value: unknown }>,
  ) {
    return this.ds.transaction(async (trx) => {
      const valueRepo = trx.getRepository(IssueFieldValue);
      const valueOptRepo = trx.getRepository(IssueFieldValueOption);
      const fieldDefRepo = trx.getRepository(FieldDefinition);
      const issueRepo = trx.getRepository(Issue);

      const issue = await issueRepo.findOne({ where: { id: issueId } });
      if (!issue) throw new NotFoundException('Issue not found');

      for (const { fieldDefId, value } of updates) {
        const fd = await fieldDefRepo.findOne({ where: { id: fieldDefId } });
        if (!fd) continue;

        let v = await valueRepo
          .createQueryBuilder('v')
          .leftJoin('v.issue', 'iss')
          .leftJoin('v.fieldDef', 'fd')
          .where('iss.id = :issueId', { issueId })
          .andWhere('fd.id = :fdId', { fdId: fieldDefId })
          .leftJoinAndSelect('v.options', 'vopt')
          .leftJoinAndSelect('vopt.option', 'opt')
          .getOne();

        // nullázó
        const reset: Partial<IssueFieldValue> = {
          valueText: null,
          valueNumber: null,
          valueBool: null,
          valueDate: null,
          valueDatetime: null,
          valueUserId: null,
          valueJson: null,
        };

        // MULTI_OPTION: biztosíts value rekordot, majd cseréld a kapcsolótáblát
        if (fd.dataType === DataType.MULTI_OPTION) {
          if (!v)
            v = await valueRepo.save(
              valueRepo.create({ issue, fieldDef: fd, ...reset }),
            );
          // törlés & beszúrás
          await valueOptRepo
            .createQueryBuilder()
            .delete()
            .where('issueFieldValueId = :id', { id: v.id })
            .execute();

          if (Array.isArray(value) && value.length) {
            const optionIds = (value as unknown[]).filter(
              (x): x is string => typeof x === 'string',
            );
            if (optionIds.length) {
              await valueOptRepo.insert(
                optionIds.map((optionId) => ({
                  issueFieldValue: { id: v!.id },
                  option: { id: optionId },
                })),
              );
            }
          }
          // frissített updatedAt
          await valueRepo.update(v.id, { updatedAt: new Date() });
          continue;
        }

        // Single-value mezők
        const patch: Partial<IssueFieldValue> = { ...reset };
        const dataType = fd.dataType as DataType;
        switch (dataType) {
          case DataType.TEXT:
            patch.valueText = toStringOrNull(value);
            break;
          case DataType.NUMBER: // !!! decimal → string !!!
            patch.valueNumber = value == null ? null : String(value);
            break;
          case DataType.BOOL:
            patch.valueBool = toBoolOrNull(value);
            break;
          case DataType.DATE:
            patch.valueDate = isISODate(value) ? value : null;
            break;
          case DataType.DATETIME:
            patch.valueDatetime = toDateOrNull(value);
            break;
          case DataType.USER:
            patch.valueUserId = isUUID(value) ? value : null;
            break;
          case DataType.OPTION:
            patch.valueJson =
              typeof value === 'string' && value ? { optionId: value } : null;
            break;
          case DataType.LINK:
            patch.valueJson = isLinkJson(value) ? value : null;
            break;
          default:
            patch.valueJson = value ?? null;
            break;
        }

        if (v) {
          await valueRepo.update(v.id, { ...patch, updatedAt: new Date() });
        } else {
          await valueRepo.insert({
            issue,
            fieldDef: fd,
            ...patch,
            updatedAt: new Date(),
          });
        }
      }

      return { ok: true };
    });
  }

  async findByUser(userId: string, query: UserIssuesQueryDto) {
    const { page = 1, limit = 25, role = 'assignee', sort } = query;

    const qb = this.issueRepository
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.project', 'p')
      .leftJoinAndSelect('i.status', 's')
      .leftJoinAndSelect('i.priority', 'pr')
      .leftJoinAndSelect('i.issueType', 'it')
      .where('1=1');

    this.applyUserRoleFilter(qb, role, userId);
    this.applyFilters(qb, query);

    // rendezés
    const sortSpec = this.parseSort(sort);
    for (const [col, dir] of Object.entries(sortSpec)) {
      const column = col === 'priorityRank' ? 'pr.rank' : `i.${col}`;
      qb.addOrderBy(column, dir);
    }
    qb.addOrderBy('i.id', 'DESC'); // tie-breaker

    // lapozás
    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return items.map((i) => ({
      id: i.id,
      key: i.key,
      project: { id: i.project.id, key: i.project.key, name: i.project.name },
      issueType: { id: i.issueType.id, name: i.issueType.name },
      summary: i.summary,
      status: {
        id: i.status.id,
        name: i.status.name,
        category: i.status.category,
      },
      priority: i.priority
        ? { id: i.priority.id, name: i.priority.name }
        : null,
      assigneeId: i.assignee?.id,
      reporterId: i.reporter?.id,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    }));
  }

  //Todo
  // setValue(id: string, fieldKey: string, value: any) {
  //   // Implement the logic to set a specific field value of the issue
  //   // return this.issueRepository.update(id, { [fieldKey]: value });
  // }

  async getIssueLinks(issueId: string): Promise<IssueLinkDto[]> {
    const { out, inn } = await this.linkRepo.findByIssue(issueId);

    const mapOut = out.map((l) => ({
      id: l.id,
      linkType: {
        id: l.linkType.id,
        name: l.linkType.name,
        inward: l.linkType.inwardLabel,
        outward: l.linkType.outwardLabel,
      },
      direction: 'OUT' as const,
      otherIssue: {
        id: l.dstIssue.id,
        key: l.dstIssue.key,
        summary: l.dstIssue.summary,
        status: {
          id: l.dstIssue.status.id,
          name: l.dstIssue.status.name,
          category: l.dstIssue.status.category,
        },
      },
    }));

    const mapIn = inn.map((l) => ({
      id: l.id,
      linkType: {
        id: l.linkType.id,
        name: l.linkType.name,
        inward: l.linkType.inwardLabel,
        outward: l.linkType.outwardLabel,
      },
      direction: 'IN' as const,
      otherIssue: {
        id: l.srcIssue.id,
        key: l.srcIssue.key,
        summary: l.srcIssue.summary,
        status: {
          id: l.srcIssue.status.id,
          name: l.srcIssue.status.name,
          category: l.srcIssue.status.category,
        },
      },
    }));

    return [...mapOut, ...mapIn];
  }

  async addIssueLink(
    issueId: string,
    payload: {
      linkTypeId: string;
      otherIssueId: string;
      direction: 'OUT' | 'IN';
    },
  ) {
    const { linkTypeId, otherIssueId, direction } = payload;
    return direction === 'OUT'
      ? this.linkRepo.createLink(issueId, otherIssueId, linkTypeId)
      : this.linkRepo.createLink(otherIssueId, issueId, linkTypeId);
  }

  async deleteIssueLink(linkId: string) {
    await this.linkRepo.deleteLink(linkId);
    return { ok: true };
  }

  async getIssueComments(issueId: string): Promise<IssueCommentDto[]> {
    const list = await this.commentRepo.findByIssue(issueId);
    return list.map((c) => {
      return {
        id: c.id,
        author: c.author || '',
        body: c.body,
        createdAt: c.createdAt.toISOString(),
      };
    });
  }

  async addIssueComment(issueId: string, authorId: string, body: string) {
    const c = await this.commentRepo.add(issueId, authorId, body);
    // opcionális: history bejegyzés
    await this.historyRepo.add({
      issueId,
      actorId: authorId,
      items: [{ fieldKey: 'comment', from: null, to: 'added' }],
    });
    return c;
  }

  async editIssueComment(commentId: string, authorId: string, body: string) {
    await this.commentRepo.updateBody(commentId, body);
    await this.historyRepo.add({
      issueId: await this.findIssueIdByComment(commentId),
      actorId: authorId,
      items: [{ fieldKey: 'comment', from: 'edited', to: null }],
    });
    return { ok: true };
  }

  // ---- COMMENTS ----------------------------------------------------------

  async deleteIssueComment(commentId: string, authorId: string) {
    const issueId = await this.findIssueIdByComment(commentId);
    await this.commentRepo.removeComment(commentId);
    await this.historyRepo.add({
      issueId,
      actorId: authorId,
      items: [{ fieldKey: 'comment', from: 'deleted', to: null }],
    });
    return { ok: true };
  }

  // async getIssueHistory(issueId: string): Promise<IssueHistoryItemDto[]> {
  //   const list = await this.historyRepo.findByIssue(issueId);
  //   return list.flatMap((h) =>
  //     h.items.map((it) => ({
  //       id: it.id,
  //       authorId: h.actor.id,
  //       changedAt: h.changedAt.toISOString(),
  //       items:
  //       field: it.field,
  //       from: it.from ?? null,
  //       to: it.to ?? null,
  //     })),
  //   );
  // }

  async getIssueAttachments(issueId: string): Promise<IssueAttachmentDto[]> {
    const list = await this.attachRepo.findByIssue(issueId);
    return list.map((a) => ({
      id: a.id,
      fileName: a.fileName,
      mimeType: a.mimeType,
      size: a.size,
      uploadedBy: a.uploader.id,
      createdAt: a.createdAt.toISOString(),
      url: `/api/attachment/${a.id}/download`, // vagy signed URL generálás
    }));
  }

  async addIssueAttachment(
    issueId: string,
    uploadedBy: string,
    fileMeta: {
      fileName: string;
      mimeType: string;
      size: number;
      storageKey: string;
    },
  ) {
    const a = await this.attachRepo.add({ issueId, uploadedBy, ...fileMeta });
    await this.historyRepo.add({
      issueId,
      actorId: uploadedBy,
      items: [
        { fieldKey: 'attachment', from: null, to: `+ ${fileMeta.fileName}` },
      ],
    });
    return a;
  }

  // async deleteIssueAttachment(attachmentId: string, userId: string) {
  //   // opcionális: issueId kinyerése history-hoz
  //   const row = await this.attachRepo
  //     .createQueryBuilder('a')
  //     .leftJoin('a.issue', 'i')
  //     .addSelect('i.id')
  //     .where('a.id = :id', { id: attachmentId })
  //     .getOne();
  //   await this.attachRepo.removeAttachment(attachmentId);
  //   if (row?.issue?.id) {
  //     await this.historyRepo.add({
  //       issueId: row?.issue.id,
  //       actorId: userId,
  //       items: [
  //         {
  //           fieldKey: 'attachment',
  //           from: `- ${(row as any).fileName ?? ''}`,
  //           to: null,
  //         },
  //       ],
  //     });
  //   }
  //   return { ok: true };
  // }

  // ---- HISTORY -----------------------------------------------------------

  private applyUserRoleFilter(
    qb: SelectQueryBuilder<Issue>,
    role: UserIssueRole,
    userId: string,
  ) {
    if (role === 'assignee') {
      qb.andWhere('i.assigneeId = :userId', { userId });
    } else if (role === 'reporter') {
      qb.andWhere('i.reporterId = :userId', { userId });
    } else if (role === 'watcher') {
      // watchers: issue_watchers(issue_id, user_id) kapcsolótábla
      qb.innerJoin(
        'issue_watchers',
        'iw',
        'iw.issue_id = i.id AND iw.user_id = :userId',
        { userId },
      );
    }
  }

  // ---- ATTACHMENTS -------------------------------------------------------

  private applyFilters(
    qb: SelectQueryBuilder<Issue>,
    { projectId, statusId, priorityId, q }: UserIssuesQueryDto,
  ) {
    if (projectId) qb.andWhere('i.projectId = :projectId', { projectId });
    if (statusId) qb.andWhere('i.statusId = :statusId', { statusId });
    if (priorityId) qb.andWhere('i.priorityId = :priorityId', { priorityId });
    if (q)
      qb.andWhere(`(i.summary ILIKE :q OR i.description ILIKE :q)`, {
        q: `%${q}%`,
      });
  }

  private parseSort(sort?: string): SortSpec {
    if (!sort) return { createdAt: 'DESC' };
    const safeCols = new Set(['createdAt', 'updatedAt', 'key', 'priorityRank']); // whitelist
    const spec: SortSpec = {};
    for (const part of sort.split(',')) {
      const [rawCol, rawDir] = part.split(':');
      const col = rawCol?.trim();
      if (!col || !safeCols.has(col)) continue;
      spec[col] = (rawDir || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    }
    return Object.keys(spec).length ? spec : { createdAt: 'DESC' };
  }

  private async findIssueIdByComment(commentId: string): Promise<string> {
    const c = await this.commentRepo
      .createQueryBuilder('c')
      .leftJoin('c.issue', 'i')
      .addSelect('i.id')
      .where('c.id = :id', { id: commentId })
      .getOne();
    return c?.issue?.id || '';
  }
}

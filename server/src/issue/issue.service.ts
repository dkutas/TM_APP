// issue.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CFvalues, SystemValues } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { Issue } from './entities/issue.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserIssueRole, UserIssuesQueryDto } from './dto/user-issues-query.dto';
import { IssueRepository } from '../repositories/issue.repository';
import { FieldContextRepository } from '../repositories/field-context.repository';
import { IssueFieldValueRepository } from '../repositories/issue-field-value.repository';
import { FieldDefinition } from '../field-definition/entities/field-definition.entity';
// ... other imports
import {
  FieldDefsDTO,
  FieldDto,
  IssueAttachmentDto,
  IssueCommentDto,
  IssueHistoryItemDto,
  IssueLinkDto,
  IssueTransitionDto,
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
import { ProjectIssueTypeRepository } from '../repositories/project-issue-type.repository';
import { WorkflowTransitionRepository } from '../repositories/workflow-transition.repository';
import { User } from '../user/entities/user.entity';
import { ProjectIssueType } from '../project/entities/projectIssueType.entity';
import { WorkflowStatus } from '../workflow/entities/workflow.entity';
import { Priority } from '../priority/entities/priority.entity';
import { isObject } from 'class-validator';

type OptionJson = { optionId: string };
type UserJson = { userId: string };

const isOptionJson = (x: unknown): x is OptionJson =>
  typeof x === 'object' &&
  x !== null &&
  typeof (x as any).optionId === 'string';
const isUserJson = (x: unknown): x is UserJson =>
  typeof x === 'object' && x !== null && typeof (x as any).userId === 'string';

const toStringOrNull = (x: unknown): string | null =>
  x == null ? null : typeof x === 'string' ? x : String(x as unknown);

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
    private readonly pitRepo: ProjectIssueTypeRepository,
    private readonly transRepo: WorkflowTransitionRepository,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

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

  remove(id: string) {
    return this.issueRepository.delete(id);
  }

  async transition(id: string, transitionId: string) {
    if (!transitionId) {
      throw new NotFoundException('Status ID is required for transition');
    }
    const transition = await this.transRepo
      .findOne({
        where: { id: transitionId },
        relations: ['fromStatus', 'toStatus'],
      })
      .then((t) => {
        if (!t) {
          throw new NotFoundException('Status ID is required for transition');
        }
        return t;
      });
    return this.issueRepository.update(id, {
      status: { id: transition.toStatus.id },
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
    const history: IssueHistoryItemDto[] = historyLogs.map((h) => ({
      id: h.id,
      authorId: h.actor.id,
      createdAt: h.createdAt.toISOString(),
      items: (h.items ?? []).map((it) => ({
        fieldKey: it.fieldKey ?? '',
        fromDisplay: it.fromDisplay ?? '',
        toDisplay: it.toDisplay ?? '',
        fromId: it.fromId ?? null,
        toId: it.toId ?? null,
      })),
    }));

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

      let value: string | null | number | object | boolean | Date;
      switch (dataType) {
        case DataType.TEXT:
          value = v?.valueText ?? null;
          break;
        case DataType.NUMBER:
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
        case DataType.USER: {
          const json = v?.valueJson as object;
          value = isUserJson(json)
            ? json.userId
            : (ctx.defaultOption?.id ?? null);
          break;
        }
        case DataType.OPTION: {
          const json = v?.valueJson as object;
          value = isOptionJson(json)
            ? json.optionId
            : (ctx.defaultOption?.id ?? null);
          break;
        }
        case DataType.MULTI_OPTION:
          value = v?.options?.map((o) => o.option.id) ?? [];
          break;
        default: {
          const json = v?.valueJson as object;
          value = json ?? null;
          break;
        }
      }

      const dto = {
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
      return dto as FieldDto;
    });

    return {
      id: issue.id,
      key: issue.key,
      summary: issue.summary,
      description: issue.description ?? null,
      project: issue.project,
      projectIssueType: issue.projectIssueType,
      priority: issue.priority,
      issueType: issue.issueType,
      status: issue.status,
      reporter: issue.reporter,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      links,
      comments,
      attachments,
      history,
      fields,
      ...basic,
    };
  }

  // ---------- UPSERT ------------------------------------------------------

  async getUserExists(userId: string): Promise<boolean> {
    return this.userRepository
      .findOne({ where: { id: userId } })
      .then((user) => !!user);
  }

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
    systemUpdates: UpdateIssueDto['systemUpdates'],
    actorId: string,
  ) {
    return this.ds.transaction(async (trx) => {
      const valueRepo = trx.getRepository(IssueFieldValue);
      const valueOptRepo = trx.getRepository(IssueFieldValueOption);
      const fieldDefRepo = trx.getRepository(FieldDefinition);

      const issue = await this.issueRepository.findOne({
        where: { id: issueId },
        relations: ['assignee', 'reporter', 'priority', 'status'],
      });

      const historyItems: Array<{
        from: string;
        to: string;
        fieldKey: string;
      }> = [];

      if (!issue) throw new NotFoundException('Issue not found');

      // rendszermezők frissítése
      for (const [key, values] of Object.entries(systemUpdates)) {
        historyItems.push({
          fieldKey: key,
          from: isObject(issue[key])
            ? (issue[key] as { id: string }).id
            : String(issue[key]) || '',
          to: values ?? '',
        });
        await this.issueRepository.update(issue.id, { [key]: values });
      }

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
            .where('issue_field_value_id = :id', { id: v.id })
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
            if (optionIds.length > 0 || v.options.length > 0) {
              historyItems.push({
                fieldKey: fd.key,
                from: JSON.stringify({
                  optionIds: v.options.map((option) => option.option.id),
                }),
                to: JSON.stringify({
                  optionIds: optionIds.map((id) => id),
                }),
              });
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
            historyItems.push({
              fieldKey: fd.key,
              from: v ? v.valueText || 'null' : 'null',
              to: String(value),
            });
            break;
          case DataType.NUMBER:
            patch.valueNumber = value == null ? null : String(value as number);
            historyItems.push({
              fieldKey: fd.key,
              from: v ? v.valueNumber || 'null' : 'null',
              to: String(value),
            });
            break;
          case DataType.BOOL:
            patch.valueBool = toBoolOrNull(value);
            historyItems.push({
              fieldKey: fd.key,
              from: v ? String(v.valueBool) || 'null' : 'null',
              to: String(value),
            });
            break;
          case DataType.DATE:
            patch.valueDate = isISODate(value) ? value : null;
            historyItems.push({
              fieldKey: fd.key,
              from: v ? v.valueDate || 'null' : 'null',
              to: String(value),
            });
            break;
          case DataType.DATETIME:
            patch.valueDatetime = toDateOrNull(value);
            historyItems.push({
              fieldKey: fd.key,
              from: v ? String(v.valueDatetime) || 'null' : 'null',
              to: String(value),
            });
            break;
          case DataType.USER: {
            patch.valueJson = (await this.getUserExists(value as string))
              ? { userId: value as string }
              : null;
            historyItems.push({
              fieldKey: fd.key,
              from: v ? JSON.stringify(v.valueJson) || 'null' : 'null',
              to: JSON.stringify({ userId: value as string }),
            });
            break;
          }
          case DataType.OPTION:
            patch.valueJson =
              typeof value === 'string' && value ? { optionId: value } : null;
            historyItems.push({
              fieldKey: fd.key,
              from: v ? JSON.stringify(v.valueJson) || 'null' : 'null',
              to: JSON.stringify({ optionId: value }),
            });
            break;
          default:
            patch.valueJson = value ?? null;
            historyItems.push({
              fieldKey: fd.key,
              from: v ? JSON.stringify(v.valueJson) || 'null' : 'null',
              to: JSON.stringify(value),
            });
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

      await this.historyRepo.add({
        issueId: issue.id,
        actorId: actorId,
        items: historyItems,
      });

      return { ok: true };
    });
  }

  async createIssue(
    projectId: string,
    projectIssueTypeId: string,
    dto: {
      cFvalues: CFvalues;
      systemValues: SystemValues;
    },
  ) {
    return this.ds.transaction(async (trx) => {
      const issueRepo = trx.getRepository(Issue);
      const pitRepo = trx.getRepository(ProjectIssueType);
      const wsRepo = trx.getRepository(WorkflowStatus);
      const prioRepo = trx.getRepository(Priority);
      const userRepo = trx.getRepository(User);
      const fdRepo = trx.getRepository(FieldDefinition);
      const valRepo = trx.getRepository(IssueFieldValue);
      const valOptRepo = trx.getRepository(IssueFieldValueOption);

      const pit = await pitRepo.findOne({
        where: {
          issueType: { id: projectIssueTypeId },
          project: { id: projectId },
        },
        relations: ['workflow', 'issueType', 'project'],
      });

      if (!pit) {
        throw new NotFoundException(
          'ProjectIssueType not found for given project',
        );
      }
      let startStatus = await wsRepo.findOne({
        where: {
          workflow: { id: pit.workflow.id },
          category: 'TODO',
        },
      });

      if (!startStatus) {
        startStatus = await wsRepo
          .createQueryBuilder('s')
          .leftJoin('s.workflow', 'w')
          .leftJoin('WorkflowTransition', 't', 't.to_status_id = s.id')
          .where('w.id = :wid', { wid: pit.workflow.id })
          .andWhere('t.id IS NULL')
          .getOne();
      }

      if (!startStatus) {
        startStatus = await wsRepo.findOne({
          where: { workflow: { id: pit.workflow.id } },
        });
      }
      if (!startStatus)
        throw new BadRequestException('No start status found for workflow');

      const {
        assignee,
        summary,
        description,
        priority: priorityId,
        dueDate,
        reporter,
      } = dto.systemValues;

      if (!summary?.trim())
        throw new BadRequestException('Summary is required');

      const priority = await prioRepo.findOne({
        where: { id: priorityId },
      });
      if (!priority)
        throw new BadRequestException(`Priority not found: ${priorityId}`);

      const reporterUser = reporter
        ? await userRepo.findOne({ where: { id: reporter } })
        : null;
      if (reporter && !reporterUser)
        throw new BadRequestException('Reporter not found');

      const assigneeUser = assignee
        ? await userRepo.findOne({ where: { id: assignee } })
        : null;
      if (assignee && !assigneeUser)
        throw new BadRequestException('Assignee not found');

      const seq =
        (await this.issueRepository.countBy({
          project: { id: projectId },
        })) + 1;
      const key = `${pit.keyPrefix ?? pit['key_prefix']}-${seq}`;

      const issue = issueRepo.create({
        project: { id: projectId },
        projectIssueType: { id: pit.id },
        issueType: { id: pit.issueType.id },
        key,
        summary: summary.trim(),
        description: description ?? null,
        status: { id: startStatus.id },
        priority: { id: priority.id },
        reporter: reporterUser ? { id: reporterUser.id } : null,
        assignee: assigneeUser ? { id: assigneeUser.id } : null,
        dueDate: dueDate ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Issue);
      const saved = await issueRepo.save(issue);

      const cfs: Array<{
        fieldDefId: string;
        value: string | number | boolean | string[] | null;
        fieldName?: string;
      }> = Array.isArray(dto.cFvalues)
        ? dto.cFvalues
        : dto.cFvalues
          ? [dto.cFvalues]
          : [];

      for (const { fieldDefId, value } of cfs) {
        const fd = await fdRepo.findOne({ where: { id: fieldDefId } });
        if (!fd) continue;

        const reset: Partial<IssueFieldValue> = {
          valueText: null,
          valueNumber: null,
          valueBool: null,
          valueDate: null,
          valueDatetime: null,
          valueUserId: null,
          valueJson: null,
        };

        if (fd.dataType === DataType.MULTI_OPTION) {
          const base = await valRepo.save(
            valRepo.create({
              issue: { id: saved.id },
              fieldDef: { id: fd.id },
              ...reset,
            }),
          );

          if (Array.isArray(value) && value.length) {
            const optionIds = (value as unknown[]).filter(
              (x): x is string => typeof x === 'string',
            );
            if (optionIds.length) {
              await valOptRepo.insert(
                optionIds.map((optionId) => ({
                  issueFieldValue: { id: base.id },
                  option: { id: optionId },
                })),
              );
            }
          }
          await valRepo.update(base.id, { updatedAt: new Date() });
          continue;
        }

        // single-value mezők
        const patch: Partial<IssueFieldValue> = { ...reset };
        switch (fd.dataType as DataType) {
          case DataType.TEXT:
            patch.valueText = toStringOrNull(value);
            break;
          case DataType.NUMBER:
            patch.valueNumber = value == null ? null : String(value as number);
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
          case DataType.USER: {
            patch.valueJson = (await this.getUserExists(value as string))
              ? { userId: value as string }
              : null;
            break;
          }
          case DataType.OPTION:
            patch.valueJson =
              typeof value === 'string' && value ? { optionId: value } : null;
            break;
          default:
            patch.valueJson = value ?? null;
            break;
        }

        await valRepo.insert({
          issue: { id: saved.id },
          fieldDef: { id: fd.id },
          ...patch,
          updatedAt: new Date(),
        });
      }

      // 7) Visszatérés
      return { ok: true, issueId: saved.id, key: saved.key };
    });
  }

  async search(userId: string, query: UserIssuesQueryDto) {
    const { page = 1, limit = 25, role, sort } = query;

    const qb = this.issueRepository
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.project', 'p')
      .leftJoinAndSelect('i.status', 's')
      .leftJoinAndSelect('i.priority', 'pr')
      .leftJoinAndSelect('i.issueType', 'it')
      .where('1=1');

    this.applyUserRoleFilter(qb, userId, role);
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
    await this.historyRepo.add({
      issueId,
      actorId: authorId,
      items: [{ fieldKey: 'comment', from: null, to: body }],
    });

    return this.commentRepo.save({
      author: { id: authorId },
      issue: { id: issueId },
      body: body,
    });
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

  async getIssueAttachments(issueId: string): Promise<IssueAttachmentDto[]> {
    const list = await this.attachRepo.findByIssue(issueId);
    return list.map((a) => ({
      id: a.id,
      fileName: a.fileName,
      mimeType: a.mimeType,
      size: a.size,
      uploadedBy: a.uploader.id,
      createdAt: a.createdAt.toISOString(),
      url: a.url,
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

  async getIssueFieldDefinitions(issueId: string): Promise<FieldDefsDTO[]> {
    const issue = await this.issues.findOneWithCore(issueId);
    if (!issue) throw new NotFoundException('Issue not found');
    const projectId = issue.project.id;
    const issueTypeId = issue.issueType.id;
    const contexts = await this.fieldCtxRepo.findApplicable(
      projectId,
      issueTypeId,
    );

    return contexts.map((ctx) => {
      const fd = ctx.fieldDef;
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
      };
    });
  }

  // ---- ATTACHMENTS -------------------------------------------------------

  async getAvailableTransitions(
    issueId: string,
  ): Promise<IssueTransitionDto[]> {
    const issue = await this.issues.findOneWithCore(issueId);
    if (!issue) throw new NotFoundException('Issue not found');

    const projectId = issue.project.id;
    const issueTypeId = issue.issueType.id;
    const fromStatusId = issue.status.id;

    // 1) projekt + issueType → workflow
    const mapping = await this.pitRepo.findWorkflow(projectId, issueTypeId);
    if (!mapping?.workflow) return []; // nincs workflow map-elve

    // 2) ebből a workflow-ból a current státuszból induló transition-ök
    const list = await this.transRepo.findForWorkflowAndFromStatus(
      mapping.workflow.id,
      fromStatusId,
    );

    // (Ha vannak szabályaid, itt tudsz szűrni: roles, conditions stb.)

    return list.map((t) => ({
      id: t.id,
      name: t.name,
      from: {
        id: t.fromStatus.id,
        key: t.fromStatus.key,
        name: t.fromStatus.name,
        category: t.fromStatus.category,
      },
      to: {
        id: t.toStatus.id,
        key: t.toStatus.key,
        name: t.toStatus.name,
        category: t.toStatus.category,
      },
    }));
  }

  private applyUserRoleFilter(
    qb: SelectQueryBuilder<Issue>,
    userId: string,
    role?: UserIssueRole,
  ) {
    if (role === 'assignee') {
      qb.andWhere('i.assignee_id = :userId', { userId });
    } else if (role === 'reporter') {
      qb.andWhere('i.reporter_id = :userId', { userId });
    }
  }

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

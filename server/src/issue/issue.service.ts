import { Injectable } from '@nestjs/common';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Issue } from './entities/issue.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserIssueRole, UserIssuesQueryDto } from './dto/user-issues-query.dto';

type SortSpec = { [prop: string]: 'ASC' | 'DESC' };

@Injectable()
export class IssueService {
  constructor(
    @InjectRepository(Issue)
    private readonly issueRepository: Repository<Issue>,
  ) {}

  create(createIssueDto: CreateIssueDto) {
    return this.issueRepository.create(createIssueDto);
  }

  findAll() {
    return this.issueRepository.find({
      relations: ['status', 'assignee', 'reporter', 'project', 'priority'],
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
    console.log(statusId);
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
      relations: ['status', 'assignee', 'reporter', 'project', 'priority'],
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
  setValue(id: string, fieldKey: string, value: any) {
    // Implement the logic to set a specific field value of the issue
    // return this.issueRepository.update(id, { [fieldKey]: value });
  }

  private applyUserRoleFilter(
    qb: SelectQueryBuilder<Issue>,
    role: UserIssueRole,
    userId: string,
  ) {
    if (role === 'assignee') {
      qb.andWhere('i.assignee.id = :userId', { userId });
    } else if (role === 'reporter') {
      qb.andWhere('i.reporter.id = :userId', { userId });
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
      const dir = (rawDir || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      spec[col] = dir;
    }
    return Object.keys(spec).length ? spec : { createdAt: 'DESC' };
  }
}

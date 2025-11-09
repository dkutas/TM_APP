import { Injectable, Logger } from '@nestjs/common';
import { CreateLinkTypeDto } from './dto/create-link-type.dto';
import { UpdateLinkTypeDto } from './dto/update-link-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LinkType } from './entities/link-type.entity';
import { IssueLink } from './entities/issue-link.entity';
import { ChangeLogRepository } from '../change-log/change-log.repository';
import { Issue } from '../issue/entities/issue.entity';

@Injectable()
export class LinkTypeService {
  private readonly logger = new Logger(LinkTypeService.name);

  constructor(
    @InjectRepository(LinkType)
    private linkTypeRepository: Repository<LinkType>,
    @InjectRepository(IssueLink)
    private issueLinkRepository: Repository<IssueLink>,
    @InjectRepository(ChangeLogRepository)
    private changeLogRepository: ChangeLogRepository,
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,
  ) {}

  create(createLinkTypeDto: CreateLinkTypeDto) {
    return this.linkTypeRepository.create(createLinkTypeDto);
  }

  findAll() {
    return this.linkTypeRepository.find();
  }

  findOne(id: string) {
    return this.linkTypeRepository.findOne({ where: { id } });
  }

  update(id: string, updateLinkTypeDto: UpdateLinkTypeDto) {
    return this.linkTypeRepository.update(id, updateLinkTypeDto);
  }

  remove(id: string) {
    return this.linkTypeRepository.delete(id);
  }

  async linkIssues(
    srcIssueId: string,
    dstIssueId: string,
    linkTypeId: string,
    userId: string,
  ) {
    this.logger.log(userId, 'Link type', linkTypeId);
    const issueLink = this.issueLinkRepository.create({
      srcIssue: { id: srcIssueId },
      dstIssue: { id: dstIssueId },
      linkType: { id: linkTypeId },
    });
    const linkType = await this.linkTypeRepository.findOne({
      where: { id: linkTypeId },
      relations: {},
    });

    const srcIssue = await this.issueRepository.findOne({
      where: { id: srcIssueId },
    });
    const dstIssue = await this.issueRepository.findOne({
      where: { id: dstIssueId },
    });

    if (!srcIssue || !dstIssue) {
      throw new Error('Source or destination issue not found');
    }

    if (!linkType) {
      throw new Error('Link type not found');
    }

    if (userId) {
      await this.changeLogRepository.add({
        issueId: srcIssueId,
        actorId: userId,
        items: [
          {
            fieldKey: 'Linked Issue',
            from: null,
            to: `Linked to issue ${dstIssue.key} with link type ${linkType.outwardLabel}`,
          },
        ],
      });
      await this.changeLogRepository.add({
        issueId: dstIssueId,
        actorId: userId,
        items: [
          {
            fieldKey: 'Linked Issue',
            from: null,
            to: `Linked to issue ${srcIssue.key} with link type ${linkType.inwardLabel}`,
          },
        ],
      });
    }
    return this.issueLinkRepository.save(issueLink);
  }

  async deleteIssueLink(issueLinkId: string, userId: string) {
    this.logger.log(userId);

    const issueLink = await this.issueLinkRepository.findOne({
      where: { id: issueLinkId },
      relations: ['linkType', 'srcIssue', 'dstIssue'],
    });

    if (!issueLink) {
      throw new Error('Issue link not found');
    }

    await this.changeLogRepository.add({
      issueId: issueLink.srcIssue.id,
      actorId: userId,
      items: [
        {
          fieldKey: 'Linked Issue',
          from: `Deleted link to issue ${issueLink.dstIssue.key} with link type ${issueLink.linkType.outwardLabel}`,
          to: null,
        },
      ],
    });
    await this.changeLogRepository.add({
      issueId: issueLink.dstIssue.id,
      actorId: userId,
      items: [
        {
          fieldKey: 'Linked Issue',
          from: `Deleted link to issue ${issueLink.srcIssue.key} with link type ${issueLink.linkType.inwardLabel}`,
          to: null,
        },
      ],
    });

    return this.issueLinkRepository.delete(issueLinkId);
  }
}

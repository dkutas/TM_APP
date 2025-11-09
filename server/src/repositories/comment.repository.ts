import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Comment } from '../comment/entities/comment.entity';

@Injectable()
export class CommentRepository extends Repository<Comment> {
  constructor(ds: DataSource) {
    super(Comment, ds.createEntityManager());
  }

  findByIssue(issueId: string) {
    return this.createQueryBuilder('c')
      .innerJoin('c.issue', 'i')
      .leftJoinAndSelect('c.author', 'author')
      .leftJoinAndSelect('c.issue', 'issue')
      .where('i.id = :issueId', { issueId })
      .orderBy('c.createdAt', 'DESC')
      .getMany();
  }

  updateBody(commentId: string, body: string) {
    return this.update(commentId, { body });
  }

  removeComment(commentId: string) {
    return this.delete(commentId);
  }
}

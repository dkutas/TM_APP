// repositories/comment.repository.ts
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
      .orderBy('c.createdAt', 'ASC')
      .getMany();
  }

  add(issueId: string, authorId: string, body: string) {
    return this.save(
      this.create({
        issue: { id: issueId },
        author: { id: authorId },
        body,
      }),
    );
  }

  updateBody(commentId: string, body: string) {
    return this.update(commentId, { body });
  }

  removeComment(commentId: string) {
    return this.delete(commentId);
  }
}

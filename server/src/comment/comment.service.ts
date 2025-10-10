import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  create(createCommentDto: CreateCommentDto) {
    return this.commentRepository.create(createCommentDto);
  }

  findAll() {
    return this.commentRepository.find();
  }

  remove(id: string) {
    return this.commentRepository.delete(id);
  }
}

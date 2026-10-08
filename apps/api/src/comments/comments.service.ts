import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Post } from '../posts/entities/post.entity';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private readonly comments: Repository<Comment>,
    @InjectRepository(Post) private readonly posts: Repository<Post>,
    private readonly dataSource: DataSource,
  ) {}

  async findByPost(postId: string): Promise<Comment[]> {
    await this.assertPostExists(postId);
    return this.comments.find({
      where: { postId },
      relations: { author: true },
      order: { createdAt: 'ASC' },
    });
  }

  async create(
    postId: string,
    authorId: string,
    body: string,
    parentId?: string,
  ): Promise<Comment> {
    await this.assertPostExists(postId);
    if (parentId) {
      const parent = await this.comments.findOneBy({ id: parentId });
      if (!parent || parent.postId !== postId) {
        throw new UnprocessableEntityException(
          'parentId must be a comment of this post',
        );
      }
      if (parent.parentId) {
        throw new UnprocessableEntityException('Replies cannot be replied to');
      }
    }

    const id = await this.dataSource.transaction(async (manager) => {
      const saved = await manager.save(
        manager.create(Comment, {
          postId,
          authorId,
          parentId: parentId ?? null,
          body: body.trim(),
        }),
      );
      await manager.increment(Post, { id: postId }, 'commentsCount', 1);
      return saved.id;
    });
    return this.comments.findOneOrFail({
      where: { id },
      relations: { author: true },
    });
  }

  private async assertPostExists(postId: string): Promise<void> {
    if (!(await this.posts.existsBy({ id: postId }))) {
      throw new NotFoundException('Post not found');
    }
  }
}

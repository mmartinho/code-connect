import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Post } from '../posts/entities/post.entity';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';

describe('CommentsService', () => {
  const comments = { findOneBy: jest.fn(), findOneOrFail: jest.fn() };
  const posts = { existsBy: jest.fn() };
  const manager = {
    create: jest.fn((_entity: unknown, data: object) => data),
    save: jest.fn().mockResolvedValue({ id: 'c-new' }),
    increment: jest.fn(),
  };
  const dataSource = {
    transaction: jest.fn((work: (m: typeof manager) => unknown) =>
      work(manager),
    ),
  };
  let service: CommentsService;

  beforeEach(() => {
    jest.clearAllMocks();
    posts.existsBy.mockResolvedValue(true);
    comments.findOneOrFail.mockResolvedValue({ id: 'c-new' });
    service = new CommentsService(
      comments as unknown as Repository<Comment>,
      posts as unknown as Repository<Post>,
      dataSource as unknown as DataSource,
    );
  });

  it('creates a top-level comment and bumps the post counter', async () => {
    await service.create('p1', 'u1', '  oi  ');
    expect(manager.create).toHaveBeenCalledWith(Comment, {
      postId: 'p1',
      authorId: 'u1',
      parentId: null,
      body: 'oi',
    });
    expect(manager.increment).toHaveBeenCalledWith(
      Post,
      { id: 'p1' },
      'commentsCount',
      1,
    );
  });

  it('accepts a reply to a top-level comment of the same post', async () => {
    comments.findOneBy.mockResolvedValue({
      id: 'c1',
      postId: 'p1',
      parentId: null,
    });
    await expect(service.create('p1', 'u1', 'ok', 'c1')).resolves.toBeDefined();
  });

  it('rejects a reply to a comment of another post', async () => {
    comments.findOneBy.mockResolvedValue({
      id: 'c1',
      postId: 'other',
      parentId: null,
    });
    await expect(service.create('p1', 'u1', 'ok', 'c1')).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
  });

  it('rejects a reply to a reply', async () => {
    comments.findOneBy.mockResolvedValue({
      id: 'c2',
      postId: 'p1',
      parentId: 'c1',
    });
    await expect(service.create('p1', 'u1', 'ok', 'c2')).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('404s when the post does not exist', async () => {
    posts.existsBy.mockResolvedValue(false);
    await expect(service.create('nope', 'u1', 'oi')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

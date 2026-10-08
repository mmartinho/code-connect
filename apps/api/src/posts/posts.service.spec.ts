import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PostLike } from './entities/post-like.entity';
import { Post } from './entities/post.entity';
import { Tag } from './entities/tag.entity';
import { PostsService } from './posts.service';
import { ThumbnailStorage } from './thumbnail-storage';

describe('PostsService', () => {
  const posts = {
    findOneBy: jest.fn(),
    existsBy: jest.fn(),
    delete: jest.fn(),
  };
  const manager = {
    createQueryBuilder: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
    delete: jest.fn(),
  };
  const dataSource = {
    transaction: jest.fn((work: (m: typeof manager) => unknown) =>
      work(manager),
    ),
  };
  const thumbnails = { save: jest.fn(), remove: jest.fn() };
  let service: PostsService;

  const insertResult = (affectedRows: number) => {
    const builder = {
      insert: () => builder,
      into: () => builder,
      values: () => builder,
      orIgnore: () => builder,
      execute: () => Promise.resolve({ raw: { affectedRows } }),
    };
    manager.createQueryBuilder.mockReturnValue(builder);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    posts.existsBy.mockResolvedValue(true);
    service = new PostsService(
      posts as unknown as Repository<Post>,
      {} as Repository<Tag>,
      {} as Repository<PostLike>,
      dataSource as unknown as DataSource,
      thumbnails as unknown as ThumbnailStorage,
    );
  });

  describe('remove', () => {
    it('deletes the post and its thumbnail when the user is the author', async () => {
      posts.findOneBy.mockResolvedValue({
        id: 'p1',
        authorId: 'u1',
        thumbnailPath: 'a.png',
      });
      await service.remove('p1', 'u1');
      expect(posts.delete).toHaveBeenCalledWith({ id: 'p1' });
      expect(thumbnails.remove).toHaveBeenCalledWith('a.png');
    });

    it('refuses to delete a post that belongs to someone else', async () => {
      posts.findOneBy.mockResolvedValue({ id: 'p1', authorId: 'u1' });
      await expect(service.remove('p1', 'u2')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(posts.delete).not.toHaveBeenCalled();
    });

    it('404s when the post does not exist', async () => {
      posts.findOneBy.mockResolvedValue(null);
      await expect(service.remove('p1', 'u1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('like', () => {
    it('increments the counter when the like is new', async () => {
      insertResult(1);
      await service.like('p1', 'u1');
      expect(manager.increment).toHaveBeenCalledWith(
        Post,
        { id: 'p1' },
        'likesCount',
        1,
      );
    });

    it('does not increment again when the user already liked', async () => {
      insertResult(0);
      await service.like('p1', 'u1');
      expect(manager.increment).not.toHaveBeenCalled();
    });

    it('404s for an unknown post', async () => {
      posts.existsBy.mockResolvedValue(false);
      await expect(service.like('nope', 'u1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('unlike', () => {
    it('decrements only when a like was actually removed', async () => {
      manager.delete.mockResolvedValueOnce({ affected: 1 });
      await service.unlike('p1', 'u1');
      expect(manager.decrement).toHaveBeenCalledTimes(1);

      manager.delete.mockResolvedValueOnce({ affected: 0 });
      await service.unlike('p1', 'u1');
      expect(manager.decrement).toHaveBeenCalledTimes(1);
    });
  });
});

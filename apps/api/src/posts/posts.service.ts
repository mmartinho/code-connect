import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsQueryDto } from './dto/list-posts-query.dto';
import { PostLike } from './entities/post-like.entity';
import { Post } from './entities/post.entity';
import { Tag } from './entities/tag.entity';
import { toBooleanSearch } from './search-query';
import { ThumbnailStorage } from './thumbnail-storage';

export interface PostWithLike {
  post: Post;
  likedByMe: boolean;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly posts: Repository<Post>,
    @InjectRepository(Tag) private readonly tags: Repository<Tag>,
    @InjectRepository(PostLike) private readonly likes: Repository<PostLike>,
    private readonly dataSource: DataSource,
    private readonly thumbnails: ThumbnailStorage,
  ) {}

  async findAll(
    query: ListPostsQueryDto,
    userId?: string,
  ): Promise<{ items: PostWithLike[]; total: number }> {
    const qb = this.posts
      .createQueryBuilder('post')
      .innerJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.tags', 'tag');

    const text = query.q?.trim();
    if (text) {
      const boolean = toBooleanSearch(text);
      if (boolean) {
        qb.andWhere(
          'MATCH(post.title, post.body) AGAINST (:boolean IN BOOLEAN MODE)',
          { boolean },
        );
      } else {
        // Terms too short for the FULLTEXT index: fall back to LIKE.
        const like = `%${text.replace(/[\\%_]/g, '\\$&')}%`;
        qb.andWhere('(post.title LIKE :like OR post.body LIKE :like)', {
          like,
        });
      }
    }

    const tagNames = [
      ...new Set(
        (query.tags ?? '')
          .split(',')
          .map((name) => name.trim().toLowerCase())
          .filter(Boolean),
      ),
    ];
    if (tagNames.length > 0) {
      qb.andWhere(
        `post.id IN (SELECT pt.post_id FROM post_tags pt INNER JOIN tags t ON t.id = pt.tag_id WHERE t.name IN (:...tagNames) GROUP BY pt.post_id HAVING COUNT(DISTINCT t.id) = :tagCount)`,
        { tagNames, tagCount: tagNames.length },
      );
    }

    if (query.sort === 'popular') qb.orderBy('post.likesCount', 'DESC');
    else qb.orderBy('post.createdAt', 'DESC');
    qb.addOrderBy('post.createdAt', 'DESC');
    qb.addOrderBy('post.id', 'ASC');

    const [posts, total] = await qb
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    const liked = await this.likedPostIds(
      posts.map((post) => post.id),
      userId,
    );
    return {
      items: posts.map((post) => ({ post, likedByMe: liked.has(post.id) })),
      total,
    };
  }

  async findOne(id: string, userId?: string): Promise<PostWithLike> {
    const post = await this.posts.findOne({
      where: { id },
      relations: { author: true, tags: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    const liked = await this.likedPostIds([post.id], userId);
    return { post, likedByMe: liked.has(post.id) };
  }

  async create(
    authorId: string,
    dto: CreatePostDto,
    thumbnail?: Express.Multer.File,
  ): Promise<PostWithLike> {
    const tags = await this.resolveTags(dto.tags);
    const thumbnailPath = thumbnail
      ? await this.thumbnails.save(thumbnail)
      : null;
    const post = await this.posts.save(
      this.posts.create({
        authorId,
        title: dto.title.trim(),
        body: dto.body.trim(),
        code: dto.code?.trim() || null,
        thumbnailPath,
        tags,
      }),
    );
    return this.findOne(post.id, authorId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const post = await this.posts.findOneBy({ id });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) {
      throw new ForbiddenException('Only the author can delete this post');
    }
    await this.posts.delete({ id });
    if (post.thumbnailPath) await this.thumbnails.remove(post.thumbnailPath);
  }

  /** Idempotent: liking twice keeps a single like. */
  async like(id: string, userId: string): Promise<void> {
    await this.assertExists(id);
    await this.dataSource.transaction(async (manager) => {
      const result = await manager
        .createQueryBuilder()
        .insert()
        .into(PostLike)
        .values({ postId: id, userId })
        .orIgnore()
        .execute();
      if (result.raw.affectedRows > 0) {
        await manager.increment(Post, { id }, 'likesCount', 1);
      }
    });
  }

  /** Idempotent: removing a missing like is a no-op. */
  async unlike(id: string, userId: string): Promise<void> {
    await this.assertExists(id);
    await this.dataSource.transaction(async (manager) => {
      const result = await manager.delete(PostLike, { postId: id, userId });
      if (result.affected) {
        await manager.decrement(Post, { id }, 'likesCount', 1);
      }
    });
  }

  async popularTags(
    limit: number,
  ): Promise<{ name: string; postsCount: number }[]> {
    const rows = await this.tags
      .createQueryBuilder('tag')
      .innerJoin('post_tags', 'pt', 'pt.tag_id = tag.id')
      .select('tag.name', 'name')
      .addSelect('COUNT(pt.post_id)', 'postsCount')
      .groupBy('tag.id')
      .orderBy('postsCount', 'DESC')
      .addOrderBy('tag.name', 'ASC')
      .limit(limit)
      .getRawMany<{ name: string; postsCount: string }>();
    return rows.map((row) => ({
      name: row.name,
      postsCount: Number(row.postsCount),
    }));
  }

  private async assertExists(id: string): Promise<void> {
    if (!(await this.posts.existsBy({ id }))) {
      throw new NotFoundException('Post not found');
    }
  }

  private async likedPostIds(
    postIds: string[],
    userId?: string,
  ): Promise<Set<string>> {
    if (!userId || postIds.length === 0) return new Set();
    const rows = await this.likes.findBy({ userId, postId: In(postIds) });
    return new Set(rows.map((row) => row.postId));
  }

  private async resolveTags(names: string[]): Promise<Tag[]> {
    const unique = new Map<string, string>();
    for (const name of names) {
      const trimmed = name.trim();
      if (trimmed) unique.set(trimmed.toLowerCase(), trimmed);
    }
    if (unique.size === 0) return [];
    // The column collation is case-insensitive, so this also matches "React".
    const existing = await this.tags.findBy({ name: In([...unique.values()]) });
    const known = new Set(existing.map((tag) => tag.name.toLowerCase()));
    const created = await this.tags.save(
      [...unique.entries()]
        .filter(([key]) => !known.has(key))
        .map(([, name]) => this.tags.create({ name })),
    );
    return [...existing, ...created];
  }
}

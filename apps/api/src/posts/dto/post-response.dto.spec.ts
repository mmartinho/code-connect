import { Post } from '../entities/post.entity';
import { PostDetailDto, PostSummaryDto } from './post-response.dto';

const post = (overrides: Partial<Post> = {}): Post =>
  ({
    id: 'p1',
    authorId: 'u1',
    title: 'Título',
    body: 'corpo',
    code: 'let a = 1',
    thumbnailPath: null,
    likesCount: 3,
    commentsCount: 2,
    createdAt: new Date(),
    author: { id: 'u1', name: 'Ana', email: 'ana@x.com', passwordHash: 'h' },
    tags: [
      { id: 't2', name: 'React' },
      { id: 't1', name: 'Front-end' },
    ],
    ...overrides,
  }) as Post;

describe('post response DTOs', () => {
  it('exposes only id and name of the author, and sorted tag names', () => {
    const dto = PostSummaryDto.fromEntity(post(), true);
    expect(dto.author).toEqual({ id: 'u1', name: 'Ana' });
    expect(dto.tags).toEqual(['Front-end', 'React']);
    expect(dto.likedByMe).toBe(true);
    expect(dto.links.self).toBe('/v1/posts/p1');
    expect(dto).not.toHaveProperty('body');
  });

  it('has no thumbnail url without a file, and builds one with it', () => {
    expect(PostSummaryDto.fromEntity(post(), false).thumbnailUrl).toBeNull();
    const url = PostSummaryDto.fromEntity(
      post({ thumbnailPath: 'a.png' }),
      false,
    ).thumbnailUrl;
    expect(url).toMatch(/\/uploads\/a\.png$/);
  });

  it('truncates the excerpt but keeps the full body in the detail', () => {
    const long = 'x'.repeat(300);
    expect(
      PostSummaryDto.fromEntity(post({ body: long }), false).excerpt,
    ).toHaveLength(200);
    expect(
      PostDetailDto.fromEntityForUser(post({ body: long }), 'u1').body,
    ).toBe(long);
  });

  it('only lets the author delete', () => {
    expect(PostDetailDto.fromEntityForUser(post(), 'u1').canDelete).toBe(true);
    expect(PostDetailDto.fromEntityForUser(post(), 'u2').canDelete).toBe(false);
    expect(PostDetailDto.fromEntityForUser(post(), undefined).canDelete).toBe(
      false,
    );
  });
});

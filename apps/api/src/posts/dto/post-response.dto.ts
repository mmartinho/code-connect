import { ApiProperty } from '@nestjs/swagger';
import { Post } from '../entities/post.entity';

export class AuthorDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
}

export class PostLinksDto {
  @ApiProperty({ example: '/v1/posts/0b9f6a52' }) self: string;
  @ApiProperty({ example: '/v1/posts/0b9f6a52/comments' }) comments: string;
}

export class PostSummaryDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty() excerpt: string;
  @ApiProperty({ nullable: true }) thumbnailUrl: string | null;
  @ApiProperty({ type: [String] }) tags: string[];
  @ApiProperty({ type: AuthorDto }) author: AuthorDto;
  @ApiProperty() likesCount: number;
  @ApiProperty() commentsCount: number;
  @ApiProperty() likedByMe: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty({ type: PostLinksDto }) links: PostLinksDto;

  static fromEntity(post: Post, likedByMe: boolean): PostSummaryDto {
    return {
      id: post.id,
      title: post.title,
      excerpt: toExcerpt(post.body),
      thumbnailUrl: thumbnailUrl(post.thumbnailPath),
      tags: (post.tags ?? []).map((tag) => tag.name).sort(),
      author: { id: post.author.id, name: post.author.name },
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      likedByMe,
      createdAt: post.createdAt,
      links: {
        self: `/v1/posts/${post.id}`,
        comments: `/v1/posts/${post.id}/comments`,
      },
    };
  }
}

export class PostDetailDto extends PostSummaryDto {
  @ApiProperty() body: string;
  @ApiProperty({ nullable: true }) code: string | null;
  @ApiProperty() canDelete: boolean;

  static fromEntityForUser(post: Post, userId?: string, likedByMe = false) {
    return {
      ...PostSummaryDto.fromEntity(post, likedByMe),
      body: post.body,
      code: post.code,
      canDelete: userId !== undefined && userId === post.authorId,
    } as PostDetailDto;
  }
}

export class PageMetaDto {
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() total: number;
}

export class PostPageDto {
  @ApiProperty({ type: [PostSummaryDto] }) data: PostSummaryDto[];
  @ApiProperty({ type: PageMetaDto }) meta: PageMetaDto;
  @ApiProperty({
    example: { self: '/v1/posts?page=1', next: null, prev: null },
  })
  links: { self: string; next: string | null; prev: string | null };
}

export class TagDto {
  @ApiProperty() name: string;
  @ApiProperty() postsCount: number;
}

function toExcerpt(body: string): string {
  return body.length > 200 ? `${body.slice(0, 197).trimEnd()}...` : body;
}

export function thumbnailUrl(path: string | null): string | null {
  if (!path) return null;
  const base = process.env.API_PUBLIC_URL ?? 'http://localhost:3000';
  return `${base}/uploads/${path}`;
}

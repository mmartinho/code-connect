import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Comment } from '../entities/comment.entity';

export class CreateCommentDto {
  @ApiProperty({ maxLength: 1000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  body: string;

  @ApiPropertyOptional({
    description: 'Id of the top-level comment to reply to',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class CommentAuthorDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
}

export class CommentResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() body: string;
  @ApiProperty({ nullable: true }) parentId: string | null;
  @ApiProperty({ type: CommentAuthorDto }) author: CommentAuthorDto;
  @ApiProperty() createdAt: Date;
  @ApiProperty({ type: () => [CommentResponseDto] })
  replies: CommentResponseDto[];

  static fromEntity(comment: Comment): CommentResponseDto {
    return {
      id: comment.id,
      body: comment.body,
      parentId: comment.parentId,
      author: { id: comment.author.id, name: comment.author.name },
      createdAt: comment.createdAt,
      replies: [],
    };
  }

  /** Builds the one-level thread: replies hang from their top-level comment. */
  static toThreads(comments: Comment[]): CommentResponseDto[] {
    const threads = new Map<string, CommentResponseDto>();
    for (const comment of comments) {
      if (!comment.parentId) {
        threads.set(comment.id, CommentResponseDto.fromEntity(comment));
      }
    }
    for (const comment of comments) {
      if (comment.parentId) {
        threads
          .get(comment.parentId)
          ?.replies.push(CommentResponseDto.fromEntity(comment));
      }
    }
    return [...threads.values()];
  }
}

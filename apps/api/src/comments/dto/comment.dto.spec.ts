import { Comment } from '../entities/comment.entity';
import { CommentResponseDto } from './comment.dto';

const comment = (id: string, parentId: string | null): Comment =>
  ({
    id,
    parentId,
    body: id,
    author: { id: 'u', name: 'Ana' },
    createdAt: new Date(),
  }) as Comment;

describe('CommentResponseDto.toThreads', () => {
  it('nests replies under their top-level comment, keeping order', () => {
    const threads = CommentResponseDto.toThreads([
      comment('a', null),
      comment('b', null),
      comment('a1', 'a'),
      comment('a2', 'a'),
    ]);
    expect(threads.map((t) => t.id)).toEqual(['a', 'b']);
    expect(threads[0].replies.map((r) => r.id)).toEqual(['a1', 'a2']);
    expect(threads[1].replies).toEqual([]);
  });
});

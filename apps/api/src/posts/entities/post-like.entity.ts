import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('post_likes')
export class PostLike {
  @PrimaryColumn({ name: 'post_id', length: 36 })
  postId: string;

  @PrimaryColumn({ name: 'user_id', length: 36 })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

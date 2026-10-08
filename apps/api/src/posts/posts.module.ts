import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostLike } from './entities/post-like.entity';
import { Post } from './entities/post.entity';
import { Tag } from './entities/tag.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { TagsController } from './tags.controller';
import { ThumbnailStorage } from './thumbnail-storage';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Tag, PostLike])],
  controllers: [PostsController, TagsController],
  providers: [PostsService, ThumbnailStorage],
})
export class PostsModule {}

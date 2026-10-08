import { Controller, Get, Header, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TagDto } from './dto/post-response.dto';
import { PostsService } from './posts.service';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=60')
  @ApiOperation({ summary: 'Most used tags (public)' })
  @ApiOkResponse({ type: [TagDto] })
  popular(
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ): Promise<TagDto[]> {
    return this.postsService.popularTags(Math.min(Math.max(limit, 1), 50));
  }
}

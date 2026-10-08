import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { memoryStorage } from 'multer';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsQueryDto } from './dto/list-posts-query.dto';
import {
  PostDetailDto,
  PostPageDto,
  PostSummaryDto,
} from './dto/post-response.dto';
import { PostsService } from './posts.service';
import { ThumbnailValidator } from './thumbnail.validator';

const MAX_THUMBNAIL_BYTES = 2 * 1024 * 1024;

// Responses that depend on who is asking must not be shared between users.
function setCacheHeader(res: Response, userId?: string) {
  res.setHeader('Cache-Control', userId ? 'no-store' : 'public, max-age=30');
}

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List posts (public); search, filter and sort' })
  @ApiOkResponse({ type: PostPageDto })
  async findAll(
    @Query() query: ListPostsQueryDto,
    @CurrentUser() userId: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PostPageDto> {
    setCacheHeader(res, userId);
    const { items, total } = await this.postsService.findAll(query, userId);
    const lastPage = Math.max(1, Math.ceil(total / query.limit));
    const link = (page: number) => {
      const params = new URLSearchParams(req.query as Record<string, string>);
      params.set('page', String(page));
      return `/v1/posts?${params.toString()}`;
    };
    return {
      data: items.map(({ post, likedByMe }) =>
        PostSummaryDto.fromEntity(post, likedByMe),
      ),
      meta: { page: query.page, limit: query.limit, total },
      links: {
        self: link(query.page),
        next: query.page < lastPage ? link(query.page + 1) : null,
        prev: query.page > 1 ? link(Math.min(query.page - 1, lastPage)) : null,
      },
    };
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a post (public)' })
  @ApiOkResponse({ type: PostDetailDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() userId: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PostDetailDto> {
    setCacheHeader(res, userId);
    const { post, likedByMe } = await this.postsService.findOne(id, userId);
    return PostDetailDto.fromEntityForUser(post, userId, likedByMe);
  }

  @Post()
  @HttpCode(201)
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_THUMBNAIL_BYTES },
    }),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Publish a post' })
  @ApiCreatedResponse({ type: PostDetailDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ErrorResponseDto })
  async create(
    @Body() dto: CreatePostDto,
    @CurrentUser() userId: string,
    @Res({ passthrough: true }) res: Response,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        errorHttpStatusCode: 422,
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_THUMBNAIL_BYTES }),
          new ThumbnailValidator(),
        ],
      }),
    )
    thumbnail?: Express.Multer.File,
  ): Promise<PostDetailDto> {
    const { post } = await this.postsService.create(userId, dto, thumbnail);
    res.location(`/v1/posts/${post.id}`);
    return PostDetailDto.fromEntityForUser(post, userId, false);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete one of your own posts' })
  @ApiNoContentResponse()
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() userId: string,
  ): Promise<void> {
    await this.postsService.remove(id, userId);
  }

  @Put(':id/likes/me')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like a post (idempotent)' })
  @ApiNoContentResponse()
  async like(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() userId: string,
  ): Promise<void> {
    await this.postsService.like(id, userId);
  }

  @Delete(':id/likes/me')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove your like (idempotent)' })
  @ApiNoContentResponse()
  async unlike(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() userId: string,
  ): Promise<void> {
    await this.postsService.unlike(id, userId);
  }
}

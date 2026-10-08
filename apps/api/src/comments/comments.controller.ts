import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { CommentsService } from './comments.service';
import { CommentResponseDto, CreateCommentDto } from './dto/comment.dto';

@ApiTags('comments')
@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({ summary: 'List the comments of a post (public)' })
  @ApiOkResponse({ type: [CommentResponseDto] })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async findAll(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CommentResponseDto[]> {
    res.setHeader('Cache-Control', 'no-store');
    return CommentResponseDto.toThreads(
      await this.commentsService.findByPost(postId),
    );
  }

  @Post()
  @HttpCode(201)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Comment on a post, or reply to a comment' })
  @ApiCreatedResponse({ type: CommentResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ErrorResponseDto })
  async create(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() userId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsService.create(
      postId,
      userId,
      dto.body,
      dto.parentId,
    );
    res.location(`/v1/posts/${postId}/comments/${comment.id}`);
    return CommentResponseDto.fromEntity(comment);
  }
}

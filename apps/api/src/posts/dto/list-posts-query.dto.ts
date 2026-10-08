import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class ListPostsQueryDto {
  @ApiPropertyOptional({ description: 'Full-text search over title and body' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @ApiPropertyOptional({
    example: 'react,front-end',
    description: 'Comma-separated tags; a post must have all of them',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  tags?: string;

  @ApiPropertyOptional({ enum: ['recent', 'popular'], default: 'recent' })
  @IsOptional()
  @IsIn(['recent', 'popular'])
  sort: 'recent' | 'popular' = 'recent';

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;
}

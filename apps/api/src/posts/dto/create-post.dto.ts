import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

// Multipart fields arrive as a string (one value) or an array (repeated).
const toArray = ({ value }: { value: unknown }) =>
  value === undefined || value === '' ? [] : [value].flat();

export class CreatePostDto {
  @ApiProperty({ maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  body: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  code?: string;

  @ApiPropertyOptional({ type: [String], maxItems: 5 })
  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(40, { each: true })
  tags: string[] = [];

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'jpeg, png or webp, up to 2 MB',
  })
  thumbnail?: unknown;
}

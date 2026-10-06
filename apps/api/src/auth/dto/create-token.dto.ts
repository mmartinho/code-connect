import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateTokenDto {
  @ApiProperty({ example: 'ana@exemplo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha-segura-123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

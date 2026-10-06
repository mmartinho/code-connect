import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: '0b9f6a52-3c1e-4c4e-9a53-7f1f1c6a1b11' })
  id: string;

  @ApiProperty({ example: 'Ana Souza' })
  name: string;

  @ApiProperty({ example: 'ana@exemplo.com' })
  email: string;

  @ApiProperty({ example: '2026-10-06T12:00:00.000Z' })
  createdAt: Date;

  static fromEntity(user: User): UserResponseDto {
    const { id, name, email, createdAt } = user;
    return { id, name, email, createdAt };
  }
}

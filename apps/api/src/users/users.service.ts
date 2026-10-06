import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly users: User[] = [];

  async create({ name, email, password }: CreateUserDto): Promise<User> {
    const normalizedEmail = this.normalizeEmail(email);
    if (this.findByEmail(normalizedEmail)) {
      throw new ConflictException('Email already registered');
    }

    const user: User = {
      id: randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  findByEmail(email: string): User | undefined {
    const normalizedEmail = this.normalizeEmail(email);
    return this.users.find((user) => user.email === normalizedEmail);
  }

  findById(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}

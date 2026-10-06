import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async create({ name, email, password }: CreateUserDto): Promise<User> {
    const normalizedEmail = this.normalizeEmail(email);
    if (await this.findByEmail(normalizedEmail)) {
      throw new ConflictException('Email already registered');
    }

    const user = this.users.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 10),
    });
    try {
      return await this.users.save(user);
    } catch (error) {
      // Another request may have registered the same email after our check
      if (this.isDuplicateEntry(error)) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  findByEmail(email: string): Promise<User | null> {
    return this.users.findOneBy({ email: this.normalizeEmail(email) });
  }

  findById(id: string): Promise<User | null> {
    return this.users.findOneBy({ id });
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private isDuplicateEntry(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string })?.code === 'ER_DUP_ENTRY'
    );
  }
}

import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

// Minimal in-memory stand-in for Repository<User>, for unit tests only.
export class InMemoryUsersRepository {
  readonly rows: User[] = [];

  create(data: Partial<User>): User {
    return Object.assign(new User(), data);
  }

  async save(user: User): Promise<User> {
    Object.assign(user, {
      id: user.id ?? randomUUID(),
      createdAt: user.createdAt ?? new Date(),
    });
    this.rows.push(user);
    return user;
  }

  async findOneBy(where: Partial<User>): Promise<User | null> {
    return (
      this.rows.find((row) =>
        Object.entries(where).every(([key, value]) => row[key] === value),
      ) ?? null
    );
  }

  asRepository(): Repository<User> {
    return this as unknown as Repository<User>;
  }
}

import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { QueryFailedError } from 'typeorm';
import { InMemoryUsersRepository } from './testing/in-memory-users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let repository: InMemoryUsersRepository;
  let service: UsersService;
  const dto = {
    name: ' Ana ',
    email: ' Ana@Exemplo.com ',
    password: 'senha-segura-123',
  };

  beforeEach(() => {
    repository = new InMemoryUsersRepository();
    service = new UsersService(repository.asRepository());
  });

  it('creates a user with a hashed password and normalized fields', async () => {
    const user = await service.create(dto);

    expect(user.id).toBeDefined();
    expect(user.name).toBe('Ana');
    expect(user.email).toBe('ana@exemplo.com');
    expect(user.passwordHash).not.toBe(dto.password);
    expect(await bcrypt.compare(dto.password, user.passwordHash)).toBe(true);
  });

  it('rejects a duplicated email regardless of case', async () => {
    await service.create(dto);

    await expect(
      service.create({ ...dto, email: 'ANA@exemplo.com' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('maps a unique-index violation on save to a conflict', async () => {
    jest
      .spyOn(repository, 'save')
      .mockRejectedValue(
        new QueryFailedError('INSERT', [], { code: 'ER_DUP_ENTRY' } as any),
      );

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
  });

  it('finds users by email and id', async () => {
    const user = await service.create(dto);

    expect(await service.findByEmail(' ANA@exemplo.com')).toBe(user);
    expect(await service.findById(user.id)).toBe(user);
    expect(await service.findByEmail('x@y.com')).toBeNull();
    expect(await service.findById('nope')).toBeNull();
  });
});

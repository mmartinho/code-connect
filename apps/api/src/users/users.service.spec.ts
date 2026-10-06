import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const dto = {
    name: ' Ana ',
    email: ' Ana@Exemplo.com ',
    password: 'senha-segura-123',
  };

  beforeEach(() => {
    service = new UsersService();
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

  it('finds users by email and id', async () => {
    const user = await service.create(dto);

    expect(service.findByEmail('ana@exemplo.com')).toBe(user);
    expect(service.findById(user.id)).toBe(user);
    expect(service.findByEmail('x@y.com')).toBeUndefined();
    expect(service.findById('nope')).toBeUndefined();
  });
});

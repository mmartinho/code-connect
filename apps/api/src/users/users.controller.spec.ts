import { UnauthorizedException } from '@nestjs/common';
import { InMemoryUsersRepository } from './testing/in-memory-users.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let service: UsersService;
  let controller: UsersController;
  const dto = {
    name: 'Ana',
    email: 'ana@exemplo.com',
    password: 'senha-segura-123',
  };

  beforeEach(() => {
    service = new UsersService(new InMemoryUsersRepository().asRepository());
    controller = new UsersController(service);
  });

  it('creates a user, sets Location and hides the password hash', async () => {
    const res: any = { location: jest.fn() };

    const body = await controller.create(dto, res);

    expect(res.location).toHaveBeenCalledWith(`/v1/users/${body.id}`);
    expect(body).not.toHaveProperty('passwordHash');
    expect(body.email).toBe('ana@exemplo.com');
  });

  it('returns the logged-in user or 401 when it no longer exists', async () => {
    const user = await service.create(dto);

    expect((await controller.me({ user: { sub: user.id } })).id).toBe(user.id);
    await expect(controller.me({ user: { sub: 'gone' } })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});

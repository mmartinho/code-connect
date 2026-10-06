import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let users: UsersService;
  let jwt: JwtService;
  let service: AuthService;

  beforeEach(async () => {
    users = new UsersService();
    jwt = new JwtService({ secret: 'test' });
    service = new AuthService(users, jwt);
    await users.create({
      name: 'Ana',
      email: 'ana@exemplo.com',
      password: 'senha-segura-123',
    });
  });

  it('returns a bearer token for valid credentials', async () => {
    const result = await service.signIn('ana@exemplo.com', 'senha-segura-123');

    expect(result.tokenType).toBe('Bearer');
    expect(result.expiresIn).toBe(3600);
    const payload = await jwt.verifyAsync(result.accessToken);
    expect(payload.sub).toBe(users.findByEmail('ana@exemplo.com').id);
  });

  it('rejects an unknown email and a wrong password', async () => {
    await expect(
      service.signIn('x@y.com', 'senha-segura-123'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      service.signIn('ana@exemplo.com', 'errada-errada'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

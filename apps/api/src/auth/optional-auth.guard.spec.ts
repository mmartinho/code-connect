import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtSecret } from './auth.constants';
import { OptionalAuthGuard } from './optional-auth.guard';

describe('OptionalAuthGuard', () => {
  const jwt = new JwtService({ secret: jwtSecret });
  const guard = new OptionalAuthGuard(jwt);
  const contextFor = (request: object) =>
    ({
      switchToHttp: () => ({ getRequest: () => request }),
    }) as unknown as ExecutionContext;

  it('lets anonymous requests through without a user', async () => {
    const request = { headers: {} };
    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request).not.toHaveProperty('user');
  });

  it('identifies the user when the token is valid', async () => {
    const token = await jwt.signAsync({ sub: 'user-1' });
    const request = { headers: { authorization: `Bearer ${token}` } };
    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request['user']).toMatchObject({ sub: 'user-1' });
  });

  it('treats an invalid token as anonymous instead of failing', async () => {
    const request = { headers: { authorization: 'Bearer invalid' } };
    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request).not.toHaveProperty('user');
  });
});

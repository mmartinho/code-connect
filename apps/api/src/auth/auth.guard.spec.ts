import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtSecret } from './auth.constants';
import { AuthGuard } from './auth.guard';

function contextWith(request: object) {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as ExecutionContext;
}

describe('AuthGuard', () => {
  const jwt = new JwtService({ secret: jwtSecret });
  const guard = new AuthGuard(jwt);

  it('accepts a valid bearer token and exposes the payload', async () => {
    const token = await jwt.signAsync({ sub: 'u1' });
    const request: any = { headers: { authorization: `Bearer ${token}` } };

    await expect(guard.canActivate(contextWith(request))).resolves.toBe(true);
    expect(request.user.sub).toBe('u1');
  });

  it.each([
    ['no header', {}],
    ['wrong scheme', { authorization: 'Basic abc' }],
    ['invalid token', { authorization: 'Bearer abc' }],
  ])('rejects %s', async (_, headers) => {
    await expect(
      guard.canActivate(contextWith({ headers })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

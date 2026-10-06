import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  it('delegates token creation to AuthService', async () => {
    const token = { accessToken: 't', tokenType: 'Bearer', expiresIn: 3600 };
    const signIn = jest.fn().mockResolvedValue(token);
    const controller = new AuthController({ signIn } as unknown as AuthService);

    await expect(
      controller.createToken({ email: 'a@b.com', password: 'x' }),
    ).resolves.toBe(token);
    expect(signIn).toHaveBeenCalledWith('a@b.com', 'x');
  });
});

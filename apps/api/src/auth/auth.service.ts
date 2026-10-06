import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { jwtExpiresIn } from './auth.constants';
import { TokenResponseDto } from './dto/token-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string): Promise<TokenResponseDto> {
    const user = await this.usersService.findByEmail(email);
    const valid = user && (await bcrypt.compare(password, user.passwordHash));
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      accessToken: await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
      }),
      tokenType: 'Bearer',
      expiresIn: jwtExpiresIn,
    };
  }
}

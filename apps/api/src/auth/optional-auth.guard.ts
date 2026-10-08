import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtSecret } from './auth.constants';
import { extractBearerToken } from './bearer-token';

/** Lets anonymous requests through; a valid token just identifies the user. */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = extractBearerToken(request);
    if (!token) return true;
    try {
      request['user'] = await this.jwtService.verifyAsync(token, {
        secret: jwtSecret,
      });
    } catch {
      // An invalid or expired token is treated as anonymous.
    }
    return true;
  }
}

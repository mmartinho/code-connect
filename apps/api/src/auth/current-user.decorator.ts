import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** The authenticated user's id (JWT `sub`), or undefined when anonymous. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string | undefined =>
    context.switchToHttp().getRequest().user?.sub,
);

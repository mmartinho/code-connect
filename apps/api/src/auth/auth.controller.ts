import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { AuthService } from './auth.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { TokenResponseDto } from './dto/token-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('tokens')
  @HttpCode(201)
  @ApiOperation({ summary: 'Log in and obtain a JWT access token' })
  @ApiCreatedResponse({ type: TokenResponseDto })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    description: 'Invalid credentials',
  })
  @ApiUnprocessableEntityResponse({
    type: ErrorResponseDto,
    description: 'Validation failed',
  })
  createToken(@Body() dto: CreateTokenDto): Promise<TokenResponseDto> {
    return this.authService.signIn(dto.email, dto.password);
  }
}

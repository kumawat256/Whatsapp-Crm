import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService, TokenPair } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedUser } from './types/jwt-payload.type';
import { UsersService } from '../users/users.service';

const REFRESH_COOKIE_NAME = 'refresh_token';
const REFRESH_COOKIE_PATH = '/api/auth';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {}

  // Tighter than the global default — login is the highest-value target for
  // credential-stuffing/brute-force, and a real user retrying a typo'd
  // password a few times a minute is nowhere near this limit.
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateCredentials(
      dto.email,
      dto.password,
    );
    const tokens = await this.authService.login(user, this.requestMeta(req));
    this.setRefreshCookie(res, tokens);

    return {
      accessToken: tokens.accessToken,
      user: this.toPublicUser(user),
    };
  }

  // Looser than login — refresh fires automatically (e.g. on 401, or once
  // per tab on load), so a user with several tabs open needs more headroom.
  @Public()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const tokens = await this.authService.refresh(
      rawRefreshToken,
      this.requestMeta(req),
    );
    this.setRefreshCookie(res, tokens);

    return { accessToken: tokens.accessToken };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    await this.authService.logout(rawRefreshToken);
    res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
    return { success: true };
  }

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    const fullUser = await this.usersService.findById(user.id);
    if (!fullUser) {
      throw new UnauthorizedException();
    }
    return this.toPublicUser(fullUser);
  }

  private toPublicUser(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    organizationId: string | null;
    role: { name: string; permissions: { key: string }[] };
  }) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      organizationId: user.organizationId,
      role: user.role.name,
      permissions: user.role.permissions.map((p) => p.key),
    };
  }

  private setRefreshCookie(res: Response, tokens: TokenPair) {
    res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: REFRESH_COOKIE_PATH,
      expires: tokens.refreshTokenExpiresAt,
    });
  }

  private requestMeta(req: Request) {
    return {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    };
  }
}

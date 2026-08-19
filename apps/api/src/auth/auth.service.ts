import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { UserWithRole, UsersService } from '../users/users.service';
import { OrganizationStatus } from '../generated/prisma/enums';
import { JwtAccessPayload } from './types/jwt-payload.type';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

export interface RequestMeta {
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<NonNullable<UserWithRole>> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (user.organization?.status === OrganizationStatus.SUSPENDED) {
      throw new UnauthorizedException(
        'Your account has been suspended. Contact support.',
      );
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  async login(
    user: NonNullable<UserWithRole>,
    meta: RequestMeta,
  ): Promise<TokenPair> {
    const accessToken = this.signAccessToken(user);
    const { refreshToken, refreshTokenExpiresAt } =
      await this.issueRefreshToken(user.id, meta);
    return { accessToken, refreshToken, refreshTokenExpiresAt };
  }

  async refresh(
    rawRefreshToken: string,
    meta: RequestMeta,
  ): Promise<TokenPair> {
    const payload = await this.verifyRefreshToken(rawRefreshToken);

    const existing = await this.prisma.refreshToken.findUnique({
      where: { id: payload.jti },
    });

    if (!existing || existing.userId !== payload.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (existing.revokedAt || existing.expiresAt < new Date()) {
      // Reuse of a rotated-out or expired token: treat as compromised and
      // kill every active session for this user.
      await this.prisma.refreshToken.updateMany({
        where: { userId: existing.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Refresh token is no longer valid');
    }

    const user = await this.usersService.findById(existing.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User is no longer active');
    }
    if (user.organization?.status === OrganizationStatus.SUSPENDED) {
      throw new UnauthorizedException(
        'Your account has been suspended. Contact support.',
      );
    }

    await this.prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });

    const accessToken = this.signAccessToken(user);
    const { refreshToken, refreshTokenExpiresAt } =
      await this.issueRefreshToken(user.id, meta);
    return { accessToken, refreshToken, refreshTokenExpiresAt };
  }

  /**
   * Super Admin "Login as Customer" — issues a short-lived access token for
   * the target user carrying impersonatedBy, without touching the Super
   * Admin's own session (no refresh token is issued, so "Exit impersonation"
   * is just discarding this token client-side and continuing to use the
   * Super Admin's original one).
   */
  impersonate(
    targetUser: NonNullable<UserWithRole>,
    superAdminUserId: string,
  ): { accessToken: string } {
    return { accessToken: this.signAccessToken(targetUser, superAdminUserId) };
  }

  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) return;

    try {
      const payload = await this.verifyRefreshToken(rawRefreshToken);
      await this.prisma.refreshToken.updateMany({
        where: { id: payload.jti, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Already invalid/expired — nothing to revoke.
    }
  }

  private signAccessToken(
    user: NonNullable<UserWithRole>,
    impersonatedBy?: string,
  ): string {
    const payload: JwtAccessPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      permissions: user.role.permissions.map((p) => p.key),
      organizationId: user.organizationId,
      ...(impersonatedBy ? { impersonatedBy } : {}),
    };
    return this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: parseTtlMs(this.config.get<string>('JWT_ACCESS_TTL')!) / 1000,
    });
  }

  private async issueRefreshToken(userId: string, meta: RequestMeta) {
    const ttl = this.config.get<string>('JWT_REFRESH_TTL')!;
    const ttlMs = parseTtlMs(ttl);
    const expiresAt = new Date(Date.now() + ttlMs);

    const row = await this.prisma.refreshToken.create({
      data: {
        userId,
        expiresAt,
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
      },
    });

    const refreshToken = this.jwtService.sign(
      { sub: userId, jti: row.id },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: ttlMs / 1000,
      },
    );

    return { refreshToken, refreshTokenExpiresAt: expiresAt };
  }

  private async verifyRefreshToken(
    rawRefreshToken: string,
  ): Promise<{ sub: string; jti: string }> {
    try {
      return await this.jwtService.verifyAsync(rawRefreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}

function parseTtlMs(ttl: string): number {
  const match = /^(\d+)([smhd])$/.exec(ttl);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2];
  const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit]!;
  return value * unitMs;
}

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { REQUIRE_MODULE_KEY } from '../decorators/require-module.decorator';
import { AuthenticatedUser } from '../types/jwt-payload.type';

// Login/refresh already reject a SUSPENDED organization outright (see
// AuthService), so an active session reaching this guard should never
// belong to a suspended org — the check here is defense in depth for a
// session that outlives a mid-session suspension.
//
// serviceEnabled:false is enforced more surgically: reads stay open (so a
// disabled customer can still see their dashboard and know why they're
// blocked) but any mutating request is rejected — that's what "restricted/
// billable operations" maps to without hand-annotating every endpoint.
@Injectable()
export class TenantStatusGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user: AuthenticatedUser | undefined = request.user as
      | AuthenticatedUser
      | undefined;

    // No user (public route) or Super Admin (organizationId null, not
    // subject to any customer's service state): nothing to check.
    if (!user || user.organizationId === null) {
      return true;
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id: user.organizationId },
    });
    if (!organization) {
      return true; // shouldn't happen; fail open rather than lock everyone out on a data anomaly
    }

    if (organization.status === 'SUSPENDED') {
      throw new ForbiddenException(
        'Your account has been suspended. Contact support.',
      );
    }

    const isMutating = request.method !== 'GET' && request.method !== 'HEAD';
    if (!isMutating) {
      return true; // reads always stay open — the customer can still see why they're blocked
    }

    if (!organization.serviceEnabled) {
      throw new ForbiddenException(
        'This service is currently disabled for your account. Contact support.',
      );
    }

    const requiredModule = this.reflector.getAllAndOverride<string | undefined>(
      REQUIRE_MODULE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (requiredModule) {
      const enabledModules = (organization.enabledModules ?? {}) as Record<
        string,
        boolean
      >;
      if (enabledModules[requiredModule] === false) {
        throw new ForbiddenException(
          `The "${requiredModule}" feature is disabled for your account.`,
        );
      }
    }

    return true;
  }
}

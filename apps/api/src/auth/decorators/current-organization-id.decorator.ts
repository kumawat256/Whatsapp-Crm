import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthenticatedUser } from '../types/jwt-payload.type';

// Tenant-scoped write endpoints need a real organizationId to attach the
// new row to. Super Admin sessions always have organizationId: null (they
// aren't scoped to any one customer), so a bare `user.organizationId!`
// would silently pass null through to Prisma and crash with a raw
// NOT NULL constraint violation instead of a clean, actionable error. This
// decorator turns that into a 403 at the controller boundary.
export const CurrentOrganizationId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;
    if (!user?.organizationId) {
      throw new ForbiddenException(
        'This action requires an organization context and cannot be performed by Super Admin.',
      );
    }
    return user.organizationId;
  },
);

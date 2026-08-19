import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionKey } from '../../common/permissions';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedUser } from '../types/jwt-payload.type';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionKey[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredRoles?.length && !requiredPermissions?.length) {
      return true;
    }

    const user: AuthenticatedUser | undefined = context
      .switchToHttp()
      .getRequest().user;
    if (!user) {
      throw new UnauthorizedException();
    }

    if (requiredRoles?.length && !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient role');
    }

    if (
      requiredPermissions?.length &&
      !requiredPermissions.every((p) => user.permissions.includes(p))
    ) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

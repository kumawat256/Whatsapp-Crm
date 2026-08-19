import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacGuard } from './rbac.guard';
import { AuthenticatedUser } from '../types/jwt-payload.type';

function contextWithUser(
  user: AuthenticatedUser | undefined,
): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RbacGuard', () => {
  const admin: AuthenticatedUser = {
    id: '1',
    email: 'admin@test.local',
    role: 'Admin',
    organizationId: 'org-1',
    permissions: ['users.manage', 'roles.manage'],
  };
  const agent: AuthenticatedUser = {
    id: '2',
    email: 'agent@test.local',
    role: 'Agent',
    organizationId: 'org-1',
    permissions: [],
  };

  function makeGuard(roles: string[] = [], permissions: string[] = []) {
    const reflector = {
      getAllAndOverride: jest.fn((key: string) => {
        if (key === 'roles') return roles;
        if (key === 'permissions') return permissions;
        return undefined;
      }),
    } as unknown as Reflector;
    return new RbacGuard(reflector);
  }

  it('allows access when no roles/permissions are required', () => {
    const guard = makeGuard();
    expect(guard.canActivate(contextWithUser(undefined))).toBe(true);
  });

  it('throws Unauthorized when metadata is required but no user is attached', () => {
    const guard = makeGuard([], ['users.manage']);
    expect(() => guard.canActivate(contextWithUser(undefined))).toThrow(
      UnauthorizedException,
    );
  });

  it('allows a user whose permissions satisfy the requirement', () => {
    const guard = makeGuard([], ['users.manage']);
    expect(guard.canActivate(contextWithUser(admin))).toBe(true);
  });

  it('blocks a user missing a required permission', () => {
    const guard = makeGuard([], ['users.manage']);
    expect(() => guard.canActivate(contextWithUser(agent))).toThrow(
      ForbiddenException,
    );
  });

  it('blocks a user whose role is not in the required list', () => {
    const guard = makeGuard(['Admin']);
    expect(() => guard.canActivate(contextWithUser(agent))).toThrow(
      ForbiddenException,
    );
  });

  it('allows a user whose role matches the required list', () => {
    const guard = makeGuard(['Admin']);
    expect(guard.canActivate(contextWithUser(admin))).toBe(true);
  });
});

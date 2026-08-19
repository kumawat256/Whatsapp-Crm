import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../common/pagination.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const userWithRole = {
  include: {
    role: {
      include: { permissions: true },
    },
    organization: true,
  },
} as const;

const userSummarySelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  isActive: true,
  createdAt: true,
  role: { select: { id: true, name: true } },
} as const;

export type UserWithRole = Awaited<ReturnType<UsersService['findByEmail']>>;

// The only two roles a tenant Admin may ever assign to one of their own
// users — matches CreateUserDto's roleName allowlist. Role is a global,
// unscoped table (shared across every organization), so without this list
// a tenant-facing endpoint could otherwise resolve/assign a platform role
// like Super Admin.
const TENANT_ASSIGNABLE_ROLE_NAMES = ['Admin', 'Agent'];

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      ...userWithRole,
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      ...userWithRole,
    });
  }

  async findAll(query: QueryUsersDto) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        select: userSummarySelect,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.user.count(),
    ]);
    return paginate(data, total, query.page, query.pageSize);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSummarySelect,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, dto: UpdateUserDto, currentUserId: string) {
    await this.findOne(id);

    if (dto.isActive === false && id === currentUserId) {
      throw new BadRequestException('You cannot deactivate your own account');
    }
    if (dto.roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: dto.roleId },
      });
      // Tenant-facing endpoint — a user here can only ever be re-pointed at
      // one of the two tenant roles. Without this, a free-form roleId would
      // let an Admin hand themselves (or anyone) the Super Admin role by id,
      // a platform-wide privilege escalation.
      if (!role || !TENANT_ASSIGNABLE_ROLE_NAMES.includes(role.name)) {
        throw new BadRequestException('Unknown role');
      }
      await this.assertSingleAdminPerOrg(role.name, id);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: userSummarySelect,
    });
    return updated;
  }

  async remove(id: string, currentUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (id === currentUserId) {
      throw new BadRequestException('You cannot delete your own account');
    }
    if (user.role.name === 'Admin') {
      const otherActiveAdmins = await this.prisma.user.count({
        where: { roleId: user.roleId, isActive: true, id: { not: id } },
      });
      if (otherActiveAdmins === 0) {
        throw new BadRequestException(
          'Cannot delete the last active admin account',
        );
      }
    }
    await this.prisma.user.delete({ where: { id } });
  }

  async resetPassword(id: string, newPassword: string) {
    await this.findOne(id);
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
    return { success: true };
  }

  /** Tenant-safe role picker for the create/edit user forms — never exposes the global Role table (which includes Super Admin) to a customer. */
  assignableRoles() {
    return this.prisma.role.findMany({
      where: { name: { in: TENANT_ASSIGNABLE_ROLE_NAMES } },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  async createWithRoleName(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    roleName: string;
  }) {
    const role = await this.prisma.role.findUnique({
      where: { name: input.roleName },
    });
    if (!role) {
      throw new BadRequestException(`Unknown role: ${input.roleName}`);
    }
    await this.assertSingleAdminPerOrg(role.name);
    return this.create({ ...input, roleId: role.id });
  }

  // One Admin per Organization, by design — every other cross-org
  // guarantee (separate wallet, separate plan, separate hierarchy) assumes
  // exactly one Admin owns the org. `excludeUserId` lets an update pass
  // through a no-op re-save (e.g. PATCHing an existing Admin without
  // actually changing their role).
  private async assertSingleAdminPerOrg(roleName: string, excludeUserId?: string) {
    if (roleName !== 'Admin') return;
    const existingAdmins = await this.prisma.user.count({
      where: {
        role: { name: 'Admin' },
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
    });
    if (existingAdmins > 0) {
      throw new BadRequestException(
        'This organization already has an Admin. Only one Admin is allowed per organization — add an Agent instead.',
      );
    }
  }

  async create(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    roleId: string;
    // Only needed when creating on behalf of Super Admin (unscoped context,
    // so the tenant-scoping Prisma extension won't auto-inject one). Regular
    // tenant-user creation omits this and relies on that auto-injection.
    organizationId?: string;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    return this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        roleId: input.roleId,
        ...(input.organizationId ? { organizationId: input.organizationId } : {}),
      },
      ...userWithRole,
    });
  }
}

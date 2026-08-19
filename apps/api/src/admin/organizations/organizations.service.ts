import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate } from '../../common/pagination.dto';
import { generateRandomPassword } from '../../common/random-password.util';
import { UsersService } from '../../users/users.service';
import { AuthService } from '../../auth/auth.service';
import { CreditsService } from '../../credits/credits.service';
import { OrganizationStatus } from '../../generated/prisma/enums';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { QueryOrganizationsDto } from './dto/query-organizations.dto';
import { ResetOrganizationUserPasswordDto } from './dto/reset-organization-user-password.dto';

const organizationSummarySelect = {
  id: true,
  name: true,
  status: true,
  serviceEnabled: true,
  enabledModules: true,
  planExpiresAt: true,
  createdAt: true,
  updatedAt: true,
  plan: {
    select: { id: true, name: true, credits: true, maxWhatsAppAccounts: true, durationDays: true },
  },
} as const;

/** Null = no expiry (plan cleared, or the plan itself has no duration). */
function computePlanExpiresAt(plan: { durationDays: number | null } | null): Date | null {
  if (!plan?.durationDays) return null;
  return new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000);
}

// Every read/write below runs in the Super Admin's own request context,
// which the tenant-scoping Prisma extension leaves completely unscoped (see
// prisma.service.ts) — so, unlike every tenant-facing service, none of
// these calls need an explicit organizationId filter to reach across
// customers; they already can by design.
@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly creditsService: CreditsService,
  ) {}

  async findAll(query: QueryOrganizationsDto) {
    const where = {
      ...(query.search ? { name: { contains: query.search } } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.organization.findMany({
        where,
        select: organizationSummarySelect,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.organization.count({ where }),
    ]);
    return paginate(data, total, query.page, query.pageSize);
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      select: {
        ...organizationSummarySelect,
        creditWallet: { select: { balance: true } },
        _count: {
          select: { users: true, whatsAppAccounts: true, contacts: true },
        },
        // So the Super Admin UI can offer "reset password" / "impersonate"
        // per user, not just for a guessed/default one.
        users: {
          select: { id: true, email: true, firstName: true, lastName: true, isActive: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }

  async create(dto: CreateOrganizationDto, superAdminUserId: string) {
    const existingAdmin = await this.prisma.user.findUnique({
      where: { email: dto.adminEmail },
    });
    if (existingAdmin) {
      throw new ConflictException('A user with this email already exists');
    }
    let plan = null;
    if (dto.planId) {
      plan = await this.prisma.plan.findUnique({ where: { id: dto.planId } });
      if (!plan) throw new BadRequestException('Unknown plan');
    }

    const adminRole = await this.prisma.role.findUniqueOrThrow({
      where: { name: 'Admin' },
    });
    const password = dto.adminPassword ?? generateRandomPassword();
    const generated = !dto.adminPassword;
    const passwordHash = await bcrypt.hash(password, 12);

    const { organization, admin } = await this.prisma.$transaction(
      async (tx) => {
        const organization = await tx.organization.create({
          data: {
            name: dto.name,
            planId: dto.planId ?? null,
            planExpiresAt: computePlanExpiresAt(plan),
          },
          select: organizationSummarySelect,
        });
        const admin = await tx.user.create({
          data: {
            email: dto.adminEmail,
            passwordHash,
            firstName: dto.adminFirstName,
            lastName: dto.adminLastName,
            roleId: adminRole.id,
            organizationId: organization.id,
          },
          select: { id: true, email: true, firstName: true, lastName: true },
        });
        return { organization, admin };
      },
    );

    // A plan's `credits` is the allotment it grants, not just a label —
    // assigning one at creation immediately funds the wallet with it.
    if (plan && plan.credits > 0) {
      await this.creditsService.topup(
        organization.id,
        plan.credits,
        `Plan assigned: ${plan.name}`,
        superAdminUserId,
      );
    }

    return {
      ...organization,
      admin,
      generatedPassword: generated ? password : undefined,
    };
  }

  async update(id: string, dto: UpdateOrganizationDto, superAdminUserId: string) {
    const existing = await this.findOne(id);
    let newPlan = null;
    if (dto.planId) {
      newPlan = await this.prisma.plan.findUnique({ where: { id: dto.planId } });
      if (!newPlan) throw new BadRequestException('Unknown plan');
    }

    // Only touches planExpiresAt when the plan actually changes to a
    // different one (or is cleared) — re-saving the same plan must not
    // reset the expiry clock back to a fresh full duration.
    const planChanged = dto.planId !== undefined && dto.planId !== existing.plan?.id;

    const updated = await this.prisma.organization.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.planId !== undefined ? { planId: dto.planId } : {}),
        ...(planChanged ? { planExpiresAt: computePlanExpiresAt(newPlan) } : {}),
      },
      select: organizationSummarySelect,
    });

    // Only grant credits when the plan actually changes to a different one
    // — re-saving the same plan, or clearing it, must not re-grant or claw
    // back credits.
    if (planChanged && newPlan && newPlan.credits > 0) {
      await this.creditsService.topup(
        id,
        newPlan.credits,
        `Plan assigned: ${newPlan.name}`,
        superAdminUserId,
      );
    }

    return updated;
  }

  async setStatus(id: string, status: OrganizationStatus) {
    await this.findOne(id);
    return this.prisma.organization.update({
      where: { id },
      data: { status },
      select: organizationSummarySelect,
    });
  }

  async setServiceEnabled(id: string, enabled: boolean) {
    await this.findOne(id);
    return this.prisma.organization.update({
      where: { id },
      data: { serviceEnabled: enabled },
      select: organizationSummarySelect,
    });
  }

  async updateModules(id: string, modules: Record<string, boolean>) {
    const organization = await this.findOne(id);
    for (const [key, value] of Object.entries(modules)) {
      if (typeof value !== 'boolean') {
        throw new BadRequestException(`Module "${key}" must be a boolean`);
      }
    }
    const existing =
      (organization.enabledModules as Record<string, boolean> | null) ?? {};
    return this.prisma.organization.update({
      where: { id },
      data: { enabledModules: { ...existing, ...modules } },
      select: organizationSummarySelect,
    });
  }

  async resetUserPassword(
    organizationId: string,
    dto: ResetOrganizationUserPasswordDto,
  ) {
    await this.findOne(organizationId);
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user || user.organizationId !== organizationId) {
      throw new NotFoundException('User not found in this organization');
    }
    const newPassword = dto.newPassword ?? generateRandomPassword();
    await this.usersService.resetPassword(dto.userId, newPassword);
    return {
      success: true,
      generatedPassword: dto.newPassword ? undefined : newPassword,
    };
  }

  async impersonate(
    organizationId: string,
    superAdminUserId: string,
    userId?: string,
  ) {
    await this.findOne(organizationId);
    const target = userId
      ? await this.prisma.user.findUnique({ where: { id: userId } })
      : await this.prisma.user.findFirst({
          where: { organizationId, isActive: true, role: { name: 'Admin' } },
          orderBy: { createdAt: 'asc' },
        });
    if (!target || target.organizationId !== organizationId) {
      throw new NotFoundException('No matching user found in this organization');
    }
    if (!target.isActive) {
      throw new BadRequestException('Cannot impersonate an inactive user');
    }

    const userWithRole = await this.usersService.findById(target.id);
    return this.authService.impersonate(userWithRole!, superAdminUserId);
  }
}

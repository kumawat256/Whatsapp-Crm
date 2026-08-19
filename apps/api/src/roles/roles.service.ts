import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

const roleInclude = {
  permissions: true,
  _count: { select: { users: true } },
} as const;

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.role.findMany({
      include: roleInclude,
      orderBy: { name: 'asc' },
    });
  }

  findAllPermissions() {
    return this.prisma.permission.findMany({ orderBy: { key: 'asc' } });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: roleInclude,
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('A role with this name already exists');
    }
    await this.assertPermissionKeysExist(dto.permissionKeys);

    return this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
        permissions: { connect: dto.permissionKeys.map((key) => ({ key })) },
      },
      include: roleInclude,
    });
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.getRaw(id);

    if (role.isSystem && (dto.name || dto.description !== undefined)) {
      throw new BadRequestException(
        'System roles cannot be renamed — their permission set can still be edited',
      );
    }
    if (dto.name && dto.name !== role.name) {
      const existing = await this.prisma.role.findUnique({
        where: { name: dto.name },
      });
      if (existing) {
        throw new ConflictException('A role with this name already exists');
      }
    }
    if (dto.permissionKeys) {
      await this.assertPermissionKeysExist(dto.permissionKeys);
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        ...(dto.permissionKeys
          ? { permissions: { set: dto.permissionKeys.map((key) => ({ key })) } }
          : {}),
      },
      include: roleInclude,
    });
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    if (role.isSystem) {
      throw new BadRequestException('System roles cannot be deleted');
    }
    if (role._count.users > 0) {
      throw new BadRequestException(
        'Reassign users off this role before deleting it',
      );
    }
    await this.prisma.role.delete({ where: { id } });
  }

  private async getRaw(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  private async assertPermissionKeysExist(keys: string[]) {
    const found = await this.prisma.permission.findMany({
      where: { key: { in: keys } },
      select: { key: true },
    });
    if (found.length !== keys.length) {
      const missing = keys.filter((k) => !found.some((f) => f.key === k));
      throw new BadRequestException(
        `Unknown permission key(s): ${missing.join(', ')}`,
      );
    }
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paginate, PaginationQueryDto } from '../common/pagination.dto';
import { AddMembersDto } from './dto/add-members.dto';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';

@Injectable()
export class ListsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.list.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { members: true } } },
    });
  }

  async findOne(id: string) {
    const list = await this.prisma.list.findUnique({
      where: { id },
      include: { _count: { select: { members: true } } },
    });
    if (!list) {
      throw new NotFoundException('List not found');
    }
    return list;
  }

  async members(id: string, query: PaginationQueryDto) {
    await this.findOne(id);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.listMember.findMany({
        where: { listId: id },
        include: { contact: true },
        orderBy: { addedAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.listMember.count({ where: { listId: id } }),
    ]);
    return paginate(
      data.map((m) => m.contact),
      total,
      query.page,
      query.pageSize,
    );
  }

  create(dto: CreateListDto, organizationId: string) {
    return this.prisma.list.create({ data: { ...dto, organizationId } });
  }

  async update(id: string, dto: UpdateListDto) {
    await this.findOne(id);
    return this.prisma.list.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.list.delete({ where: { id } });
  }

  async addMembers(id: string, dto: AddMembersDto) {
    const list = await this.findOne(id);
    await this.prisma.listMember.createMany({
      data: dto.contactIds.map((contactId) => ({
        listId: id,
        contactId,
        organizationId: list.organizationId,
      })),
      skipDuplicates: true,
    });
    return this.findOne(id);
  }

  async removeMember(id: string, contactId: string) {
    await this.findOne(id);
    await this.prisma.listMember.deleteMany({
      where: { listId: id, contactId },
    });
  }
}

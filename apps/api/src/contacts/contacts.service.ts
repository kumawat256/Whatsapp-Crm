import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../common/pagination.dto';
import {
  ContactsCsvService,
  ExportableContact,
  ParsedContactRow,
} from './csv/contacts-csv.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { QueryContactsDto } from './dto/query-contacts.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { isValidPhoneNumber, normalizePhoneNumber } from './phone-number.util';

export interface ImportSummary {
  totalRows: number;
  created: number;
  updated: number;
  skipped: { row: number; reason: string }[];
}

@Injectable()
export class ContactsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly csv: ContactsCsvService,
  ) {}

  async findAll(query: QueryContactsDto) {
    const where: Prisma.ContactWhereInput = {};

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search } },
        { lastName: { contains: query.search } },
        { phoneNumber: { contains: query.search } },
      ];
    }
    if (query.listId) {
      where.lists = { some: { listId: query.listId } };
    }
    if (query.isOptedOut !== undefined) {
      where.isOptedOut = query.isOptedOut === 'true';
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.contact.count({ where }),
    ]);

    return paginate(data, total, query.page, query.pageSize);
  }

  async findOne(id: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
    });
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    return contact;
  }

  async create(dto: CreateContactDto, organizationId: string) {
    // phoneNumber is unique per-organization, not globally — findFirst
    // (rather than findUnique on the bare field) lets the tenant-scoping
    // Prisma extension merge in the caller's organizationId.
    const existing = await this.prisma.contact.findFirst({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (existing) {
      throw new ConflictException(
        'A contact with this phone number already exists',
      );
    }
    return this.prisma.contact.create({ data: { ...dto, organizationId } });
  }

  async update(id: string, dto: UpdateContactDto) {
    await this.findOne(id);
    return this.prisma.contact.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.contact.delete({ where: { id } });
  }

  async setOptedOut(id: string, isOptedOut: boolean) {
    await this.findOne(id);
    return this.prisma.contact.update({
      where: { id },
      data: { isOptedOut, optedOutAt: isOptedOut ? new Date() : null },
    });
  }

  async importCsv(buffer: Buffer, organizationId: string): Promise<ImportSummary> {
    const rows = this.csv.parse(buffer);
    const summary: ImportSummary = {
      totalRows: rows.length,
      created: 0,
      updated: 0,
      skipped: [],
    };

    for (const [index, row] of rows.entries()) {
      try {
        await this.importRow(row, summary, index + 2, organizationId); // +2: header row + 1-based
      } catch (err) {
        summary.skipped.push({
          row: index + 2,
          reason: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return summary;
  }

  private async importRow(
    row: ParsedContactRow,
    summary: ImportSummary,
    rowNumber: number,
    organizationId: string,
  ) {
    if (!row.firstName || !row.phoneNumber) {
      summary.skipped.push({
        row: rowNumber,
        reason: 'Missing required firstName or phoneNumber',
      });
      return;
    }

    // India-only deployment: a number with no country code is normalized
    // to +91... automatically instead of being skipped.
    row.phoneNumber = normalizePhoneNumber(row.phoneNumber);
    if (!isValidPhoneNumber(row.phoneNumber)) {
      summary.skipped.push({
        row: rowNumber,
        reason: `phoneNumber must be a valid number, e.g. +916377720778 (got "${row.phoneNumber}")`,
      });
      return;
    }

    // phoneNumber is unique per-organization, not globally — see create().
    const existing = await this.prisma.contact.findFirst({
      where: { phoneNumber: row.phoneNumber! },
    });

    if (existing) {
      await this.prisma.contact.update({
        where: { id: existing.id },
        data: {
          firstName: row.firstName!,
          lastName: row.lastName,
          notes: row.notes,
          source: row.source,
        },
      });
      summary.updated += 1;
    } else {
      await this.prisma.contact.create({
        data: {
          firstName: row.firstName!,
          lastName: row.lastName,
          phoneNumber: row.phoneNumber!,
          notes: row.notes,
          source: row.source,
          organizationId,
        },
      });
      summary.created += 1;
    }
  }

  csvTemplate(): string {
    return this.csv.templateHeaderRow();
  }

  async exportCsv(query: QueryContactsDto): Promise<string> {
    const { data } = await this.findAll({
      ...query,
      page: 1,
      pageSize: 100000,
    });
    const exportable: ExportableContact[] = data.map((c) => ({
      firstName: c.firstName,
      lastName: c.lastName,
      phoneNumber: c.phoneNumber,
      notes: c.notes,
      source: c.source,
      isOptedOut: c.isOptedOut,
      createdAt: c.createdAt,
    }));
    return this.csv.export(exportable);
  }
}

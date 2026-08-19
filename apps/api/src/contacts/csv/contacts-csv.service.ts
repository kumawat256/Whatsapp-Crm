import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

export interface ParsedContactRow {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  notes?: string;
  source?: string;
}

export interface ExportableContact {
  firstName: string;
  lastName: string | null;
  phoneNumber: string;
  notes: string | null;
  source: string | null;
  isOptedOut: boolean;
  createdAt: Date;
}

const IMPORT_COLUMNS = ['firstName', 'lastName', 'phoneNumber', 'notes', 'source'];
const EXPORT_COLUMNS = [
  'firstName',
  'lastName',
  'phoneNumber',
  'notes',
  'source',
  'isOptedOut',
  'createdAt',
];

@Injectable()
export class ContactsCsvService {
  parse(buffer: Buffer): ParsedContactRow[] {
    const records: Record<string, string>[] = parse(buffer, {
      columns: (header: string[]) => header.map((h) => h.trim()),
      skip_empty_lines: true,
      trim: true,
    });

    return records.map((row) => ({
      firstName: row.firstName?.trim() || undefined,
      lastName: row.lastName?.trim() || undefined,
      phoneNumber: row.phoneNumber?.trim() || undefined,
      notes: row.notes?.trim() || undefined,
      source: row.source?.trim() || undefined,
    }));
  }

  templateHeaderRow(): string {
    return stringify([IMPORT_COLUMNS]);
  }

  export(contacts: ExportableContact[]): string {
    const rows = contacts.map((c) => ({
      firstName: c.firstName,
      lastName: c.lastName ?? '',
      phoneNumber: c.phoneNumber,
      notes: c.notes ?? '',
      source: c.source ?? '',
      isOptedOut: c.isOptedOut ? 'true' : 'false',
      createdAt: c.createdAt.toISOString(),
    }));

    return stringify(rows, { header: true, columns: EXPORT_COLUMNS });
  }
}

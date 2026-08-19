export interface DateRangeQuery {
  range?: 'today' | 'yesterday' | '7d' | '30d' | 'custom';
  from?: string;
  to?: string;
}

export interface ResolvedDateRange {
  gte?: Date;
  lte?: Date;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Local-time boundaries, deliberately not UTC — mirrors
// analytics.service.ts's localDateLabel reasoning: converting to UTC first
// mislabels "today" in any timezone ahead of UTC.
export function resolveDateRange(query: DateRangeQuery): ResolvedDateRange {
  const now = new Date();
  switch (query.range) {
    case 'today':
      return { gte: startOfDay(now) };
    case 'yesterday': {
      const end = startOfDay(now);
      const start = new Date(end);
      start.setDate(start.getDate() - 1);
      return { gte: start, lte: end };
    }
    case '7d': {
      const start = startOfDay(now);
      start.setDate(start.getDate() - 6);
      return { gte: start };
    }
    case '30d': {
      const start = startOfDay(now);
      start.setDate(start.getDate() - 29);
      return { gte: start };
    }
    case 'custom':
      return {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    default:
      return {};
  }
}

// Prisma `where` fragment for a `createdAt` column, or {} when the range is
// unbounded (no filter applied).
export function dateRangeWhere(
  range: ResolvedDateRange,
): { createdAt: { gte?: Date; lte?: Date } } | Record<string, never> {
  if (!range.gte && !range.lte) return {};
  return {
    createdAt: {
      ...(range.gte ? { gte: range.gte } : {}),
      ...(range.lte ? { lte: range.lte } : {}),
    },
  };
}

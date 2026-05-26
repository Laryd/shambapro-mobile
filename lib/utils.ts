import { format, parseISO, differenceInDays } from 'date-fns';

export function formatCurrency(amount: number): string {
  return `KSH ${amount.toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function formatDate(dateStr: string | Date, fmt = 'dd MMM yyyy'): string {
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return format(date, fmt);
  } catch {
    return String(dateStr);
  }
}

export function formatDateInput(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    return format(parseISO(dateStr), 'yyyy-MM-dd');
  } catch {
    return dateStr;
  }
}

export function daysLeft(dateStr?: string | null): number | null {
  if (!dateStr) return null;
  try {
    return differenceInDays(parseISO(dateStr), new Date());
  } catch {
    return null;
  }
}

export function getRatoonLabel(cycle: number): string {
  if (cycle === 0) return 'Plant Cane';
  return `Ratoon ${cycle}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return '#059669';
    case 'harvested':
      return '#0284c7';
    case 'archived':
      return '#6b7280';
    case 'repaid':
      return '#059669';
    case 'overdue':
      return '#e11d48';
    default:
      return '#6b7280';
  }
}

export function getLoanTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    mill_advance: 'Mill Advance',
    bank_loan: 'Bank Loan',
    sacco: 'SACCO',
    cooperative: 'Co-operative',
    input_credit: 'Input Credit',
    other: 'Other',
  };
  return labels[type] ?? type;
}

export function getProfitColor(amount: number): string {
  if (amount > 0) return '#059669';
  if (amount < 0) return '#e11d48';
  return '#6b7280';
}

export function truncate(text: string, maxLen = 30): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '…';
}

export function toISODate(dateStr: string): string {
  // Accepts yyyy-MM-dd or ISO string, returns ISO string
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return new Date(dateStr + 'T00:00:00.000Z').toISOString();
    }
    return new Date(dateStr).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

import { format } from 'date-fns';

export function formatDateTime(dateString: string | Date | undefined | null): string {
  try {
    if (!dateString) return 'Invalid Date';

    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    return format(date, 'dd/MM/yyyy HH:mm');
  } catch (error) {
    return 'Invalid Date';
  }
}
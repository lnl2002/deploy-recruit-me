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

export const formatDateTimeSeperate = (dateTime: string) => {
  const date = new Date(dateTime);
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return { time, formattedDate };
};
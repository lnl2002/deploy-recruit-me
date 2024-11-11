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

export function formatTimeToHHMM(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
      return ''
  }

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

export function formatISOToDateString(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
      return ''
  }

  const day = date.getDate();
  const year = date.getFullYear();

  const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
  ];
  const month = monthNames[date.getMonth()];

  return `${day} ${month} ${year}`;
}

export const formatDateTimeSeperate = (dateTime: string) => {
  const date = new Date(dateTime);
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return { time, formattedDate };
};
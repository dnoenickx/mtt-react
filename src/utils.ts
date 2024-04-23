import { DatePrecision } from './types';

export function formatDate(date: Date, precision: DatePrecision) {
  switch (precision) {
    case 'day':
      date.setHours(0, 0, 0, 0);
      return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    case 'month':
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
    case 'year':
      date.setMonth(0, 1);
      date.setHours(0, 0, 0, 0);
      return new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(date);
    default:
      return 'Unknown Date';
  }
}

export function generateRandomId(maps: { [id: number]: any }[]): number {
  const min = 1;
  const max = 9999;
  let randomNumber: number;
  do {
    randomNumber = Math.floor(min + Math.random() * (max - min + 1));
  } while (maps.some((obj) => Object.keys(obj).includes(randomNumber.toString())));

  return randomNumber;
}

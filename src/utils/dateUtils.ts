/**
 * Format a date to a string representing the distance to now
 * @param date The date to format
 * @returns A string representing the distance to now (e.g. "2 days ago")
 */
export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
}

/**
 * Format a date to a string in the format "YYYY-MM-DD"
 * @param date The date to format
 * @returns A string in the format "YYYY-MM-DD"
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Format a date to a string in the format "YYYY-MM-DD HH:MM:SS"
 * @param date The date to format
 * @returns A string in the format "YYYY-MM-DD HH:MM:SS"
 */
export function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Format a date to a human-readable string
 * @param date The date to format
 * @returns A human-readable string (e.g. "January 1, 2023")
 */
export function formatDateHuman(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return date.toLocaleDateString(undefined, options);
}

/**
 * Format a date to a time string
 * @param date The date to format
 * @returns A time string (e.g. "12:30 PM")
 */
export function formatTime(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    hour: 'numeric', 
    minute: 'numeric',
    hour12: true
  };
  
  return date.toLocaleTimeString(undefined, options);
}

/**
 * Parse a date string in the format "YYYY-MM-DD"
 * @param dateString The date string to parse
 * @returns A Date object
 */
export function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Parse a date string in the format "YYYY-MM-DD HH:MM:SS"
 * @param dateTimeString The date string to parse
 * @returns A Date object
 */
export function parseDateTime(dateTimeString: string): Date {
  const [dateStr, timeStr] = dateTimeString.split(' ');
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  
  return new Date(year, month - 1, day, hours, minutes, seconds);
}

/**
 * Check if a date is today
 * @param date The date to check
 * @returns True if the date is today, false otherwise
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is in the past
 * @param date The date to check
 * @returns True if the date is in the past, false otherwise
 */
export function isPast(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Check if a date is in the future
 * @param date The date to check
 * @returns True if the date is in the future, false otherwise
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > Date.now();
}

/**
 * Add days to a date
 * @param date The date to add days to
 * @param days The number of days to add
 * @returns A new Date object with the days added
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add months to a date
 * @param date The date to add months to
 * @param months The number of months to add
 * @returns A new Date object with the months added
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Add years to a date
 * @param date The date to add years to
 * @param years The number of years to add
 * @returns A new Date object with the years added
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

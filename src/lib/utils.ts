import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date consistently to prevent hydration mismatches
 * Uses a fixed locale and format to ensure server/client consistency
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    // Use fixed format to prevent hydration mismatches
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return `${dayNames[date.getDay()]}, ${monthNames[month]} ${day}`;
  } catch (error) {
    return 'Invalid Date';
  }
}

/**
 * Format time consistently to prevent hydration mismatches
 */
export function formatTime(date: Date): string {
  try {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return '--:--:--';
  }
}

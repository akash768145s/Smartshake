import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a timestamp as a human-readable relative time string
 * Examples:
 * - Less than 1 minute: "just now"
 * - 1-59 minutes: "5m ago"
 * - 1-23 hours: "3hr ago"
 * - 24-47 hours: "yesterday"
 * - 48+ hours: "2 days ago", "5 days ago", etc.
 */
export function formatTimeAgo(timestamp: string | Date): string {
  const now = Date.now();
  const time = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp.getTime();
  const diffMs = now - time;
  
  // Less than 1 minute
  if (diffMs < 60000) {
    return 'just now';
  }
  
  // Less than 1 hour (1-59 minutes)
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  
  // Less than 24 hours (1-23 hours)
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 24) {
    return `${hours}hr ago`;
  }
  
  // Calculate days
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  // 24-47 hours: show as "yesterday"
  if (days === 1) {
    return 'yesterday';
  }
  
  // 2+ days: show as "X days ago"
  return `${days} days ago`;
}

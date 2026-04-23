/** Formats an unread count for a notification badge: caps at 99+. */
export function formatBadgeCount(count: number): string {
  return count > 99 ? '99+' : String(count);
}

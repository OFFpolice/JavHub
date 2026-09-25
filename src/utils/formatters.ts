/**
 * Utilities for formatting views, dates, and release codes.
 */

/**
 * Extracts a release code (e.g. "ROYD-348", "SSIS-091", "121625_001")
 * from title or item.
 */
export function extractReleaseCode(item: { code?: string; title?: string }): string {
  if (item.code && item.code.trim().length > 0) {
    return item.code.trim();
  }
  if (!item.title) return '';
  const match = item.title.match(/^([A-Za-z0-9]+-[0-9A-Za-z]+|\d{6}[_-]\d{3}|[A-Za-z0-9]{3,8}\s+[0-9]{2,4})/);
  if (match) {
    return match[1].trim();
  }
  return '';
}

/**
 * Formats view count into readable short format (e.g. 10.4K, 1.2M)
 */
export function formatViews(views: number): string {
  if (!views || views === 0) return '0';
  if (views >= 1_000_000) return (views / 1_000_000).toFixed(1) + 'M';
  if (views >= 1_000) return (views / 1_000).toFixed(1) + 'K';
  return views.toString();
}

/**
 * Formats date into readable Russian localized date string
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

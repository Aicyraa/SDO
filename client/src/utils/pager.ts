export type PagerItem = number | 'gap';

/** Number of pages for `total` items; never below 1 so an empty list still has a page. */
export function pageCount(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function clampPage(page: number, total: number): number {
  return Math.min(Math.max(1, page), Math.max(1, total));
}

/** The page (1-based) that holds the first matching item, or 1 when it is not in the list (UI-POLISH-SPEC 5.4c). */
export function pageHolding<T>(items: readonly T[], isMatch: (item: T) => boolean, pageSize: number): number {
  const index = items.findIndex(isMatch);
  return index < 0 ? 1 : Math.floor(index / pageSize) + 1;
}

/** Page buttons to draw: every page when few, otherwise first, last and a window around the current page. */
export function pagerItems(current: number, total: number): PagerItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, 'gap', total];
  if (current >= total - 3) return [1, 'gap', total - 4, total - 3, total - 2, total - 1, total];
  return [1, 'gap', current - 1, current, current + 1, 'gap', total];
}

export const MIN_FIT_ROWS = 3;
export const MAX_FIT_ROWS = 50;
/** Rows per page on screens whose list is not height-bound (phones and stacked panes: the page itself scrolls). */
export const STACKED_ROWS = 10;
/** Height of the pager strip under a list (`Pager` with `py-2.5` and 34 px buttons, plus its top border), in layout pixels. */
export const PAGER_HEIGHT = 55;

/**
 * How many rows a list area can show (FINAL-POLISH-SPEC F1). `areaHeight` is the list body plus the strip the pager
 * would take. When everything fits (`total` known and at most the rows that fit with no pager) all of it shows and
 * no pager is needed; otherwise one pager strip is reserved. `trim` removes rows a measured overflow still needs
 * (group heads, a row that wrapped). Always between 3 and 50.
 */
export function fitRows({
  areaHeight,
  rowHeight,
  total,
  trim = 0,
  pagerHeight = PAGER_HEIGHT,
}: {
  areaHeight: number;
  rowHeight: number;
  total?: number;
  trim?: number;
  pagerHeight?: number;
}): number {
  const clamp = (n: number) => Math.min(MAX_FIT_ROWS, Math.max(MIN_FIT_ROWS, n));
  if (!(areaHeight > 0) || !(rowHeight > 0)) return STACKED_ROWS;
  const all = Math.floor(areaHeight / rowHeight);
  const withPager = Math.floor((areaHeight - pagerHeight) / rowHeight);
  const base = total !== undefined && total <= all ? all : withPager;
  return clamp(base - trim);
}

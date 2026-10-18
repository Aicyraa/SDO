import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MIN_FIT_ROWS, STACKED_ROWS, fitRows } from '@/utils/pager';

/** Row height assumed until a real row has been drawn and measured. */
const DEFAULT_ROW_HEIGHT = 72;
/** A pane stacks (the page scrolls instead of the card) below this container width; see MasterDetail. */
const PANES_SIDE_BY_SIDE = 800;
/** A screen outside a master-detail pair keeps its list height-bound from the icon-rail layout up. */
const RAIL_WIDTH = 720;

interface Measured {
  area: number;
  row: number;
  fixed: boolean;
}

/**
 * How many rows a list can show without scrolling (FINAL-POLISH-SPEC F1). Put `areaRef` on the box that holds the
 * list body AND its pager strip (its height must not depend on its content), mark the scrolling body
 * `data-fit-body` and each row `data-fit-row`. Rows keep their own size: the real height of the first row is measured,
 * and a measured overflow (group heads, a row that wrapped) takes off the rows it still needs.
 * Pass the list's total once known: when it all fits, the pager's strip is not reserved.
 * Where the list is not height-bound (phones, stacked panes) it returns a fixed 10.
 * `areaRef` is a callback ref, so the hook can be used above a loading state that mounts the list later.
 */
export function useFitRows(total?: number): { areaRef: (element: HTMLDivElement | null) => void; rows: number } {
  const [area, setArea] = useState<HTMLDivElement | null>(null);
  const [measured, setMeasured] = useState<Measured | null>(null);
  const [trim, setTrim] = useState(0);
  const rowHeight = useRef(DEFAULT_ROW_HEIGHT);

  const measure = useCallback(() => {
    if (!area) return;
    const firstRow = area.querySelector<HTMLElement>('[data-fit-row]');
    if (firstRow && firstRow.offsetHeight > 0) rowHeight.current = firstRow.offsetHeight;
    const host = area.closest<HTMLElement>('[data-master-detail]');
    const fixed = host ? host.clientWidth >= PANES_SIDE_BY_SIDE : window.innerWidth >= RAIL_WIDTH;
    setMeasured((previous) => {
      const next = { area: area.clientHeight, row: rowHeight.current, fixed };
      return previous && previous.area === next.area && previous.row === next.row && previous.fixed === next.fixed ? previous : next;
    });
  }, [area]);

  useLayoutEffect(() => {
    measure();
    if (!area || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(area);
    return () => observer.disconnect();
  }, [area, measure]);

  // A new window size or list starts again from the full count; a measured overflow below takes rows off again.
  useEffect(() => setTrim(0), [measured?.area, measured?.fixed, total]);

  const rows = !measured || !measured.fixed ? STACKED_ROWS : fitRows({ areaHeight: measured.area, rowHeight: measured.row, total, trim });

  // Rows are drawn: if the body still overflows (a group head, a row that wrapped), take off the rows it needs.
  useLayoutEffect(() => {
    // The first real row may just have been drawn: pick up its height (no re-render when nothing changed).
    measure();
    if (!measured?.fixed || !area || rows <= MIN_FIT_ROWS) return;
    const body = area.querySelector<HTMLElement>('[data-fit-body]');
    if (!body || !body.querySelector('[data-fit-row]')) return;
    const over = body.scrollHeight - body.clientHeight;
    if (over > 1) setTrim((value) => value + Math.max(1, Math.ceil(over / measured.row)));
  });

  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  return { areaRef: setArea, rows };
}

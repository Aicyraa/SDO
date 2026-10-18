import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { inBody } from '@/components/feedback/inBody';
import { placeAnchored, type Placement } from '@/utils/anchor';

/**
 * The tooltip box itself, drawn under `<body>` with fixed coordinates so no card with `overflow-hidden` can clip it.
 * It sits above `anchor` and flips below when there is no room above. Hidden until measured, so it never jumps.
 */
export function TooltipBubble({ anchor, id, label }: { anchor: RefObject<HTMLElement | null>; id: string; label: string }) {
  const [placement, setPlacement] = useState<Placement | null>(null);
  const tipRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const target = anchor.current;
    const tip = tipRef.current;
    if (!target || !tip) return;
    const a = target.getBoundingClientRect();
    const t = tip.getBoundingClientRect();
    setPlacement(placeAnchored({ top: a.top, left: a.left, width: a.width, height: a.height }, { width: t.width, height: t.height }, { width: window.innerWidth, height: window.innerHeight }));
  }, [anchor, label]);

  return inBody(
    <span
      ref={tipRef}
      id={id}
      role="tooltip"
      style={{ top: placement?.top ?? 0, left: placement?.left ?? 0, visibility: placement ? 'visible' : 'hidden' }}
      className="pointer-events-none fixed z-[60] w-max max-w-[220px] rounded-lg bg-ink px-2.5 py-1.5 text-xs leading-snug font-medium text-white shadow-lg"
    >
      {label}
    </span>,
  );
}

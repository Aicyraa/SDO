import { useId, useLayoutEffect, useRef, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { inBody } from '@/components/feedback/inBody';
import { placeAnchored, type Placement } from '@/utils/anchor';
import { cn } from '@/utils/cn';
import { Icon } from './Icon';

const hintVariants = cva('grid size-6 shrink-0 place-items-center rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30', {
  variants: {
    tone: {
      pending: 'bg-warn-soft text-warn-ink',
      info: 'bg-info-soft text-primary',
      bad: 'bg-bad-soft text-bad-ink',
      good: 'bg-success-soft text-success',
    },
  },
  defaultVariants: { tone: 'info' },
});

/**
 * A small status icon with a tooltip: shown on hover and keyboard focus, and toggled by a tap so it also works on
 * a phone. Screen readers get the same text as the button's name. Escape or leaving closes it.
 * The tooltip is drawn under `<body>` with fixed coordinates, so no card with `overflow-hidden` can clip it; it flips
 * below the icon when there is no room above.
 */
export function IconHint({ icon, label, tone, className }: { icon: string; label: string; className?: string } & VariantProps<typeof hintVariants>) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const id = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!open) {
      setPlacement(null);
      return;
    }
    const button = buttonRef.current;
    const tip = tipRef.current;
    if (!button || !tip) return;
    const a = button.getBoundingClientRect();
    const t = tip.getBoundingClientRect();
    setPlacement(placeAnchored({ top: a.top, left: a.left, width: a.width, height: a.height }, { width: t.width, height: t.height }, { width: window.innerWidth, height: window.innerHeight }));
  }, [open, label]);

  return (
    <span className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        className={cn(hintVariants({ tone }), className)}
        onClick={() => setOpen((value) => !value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
        }}
      >
        <Icon name={icon} filled className="!text-base" />
      </button>
      {open
        ? inBody(
            <span
              ref={tipRef}
              id={id}
              role="tooltip"
              style={{ top: placement?.top ?? 0, left: placement?.left ?? 0, visibility: placement ? 'visible' : 'hidden' }}
              className="pointer-events-none fixed z-[60] w-max max-w-[220px] rounded-lg bg-ink px-2.5 py-1.5 text-xs leading-snug font-medium text-white shadow-lg"
            >
              {label}
            </span>,
          )
        : null}
    </span>
  );
}

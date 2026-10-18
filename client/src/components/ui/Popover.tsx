import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { inBody } from '@/components/feedback/inBody';
import { placeAnchored, type Placement } from '@/utils/anchor';
import { cn } from '@/utils/cn';
import { Icon } from './Icon';

/**
 * An icon button that opens a small note beside it (instructions, help text). Opens on click or tap, closes on a
 * second click, on Escape (focus returns to the button) and on a click outside. The note is drawn under `<body>`
 * with fixed coordinates, like TooltipBubble, so no card can clip it.
 */
export function Popover({ icon, label, title, children, className }: { icon: string; label: string; title: string; children: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const id = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open) {
      setPlacement(null);
      return;
    }
    const button = buttonRef.current;
    const panel = panelRef.current;
    if (!button || !panel) return;
    const a = button.getBoundingClientRect();
    const p = panel.getBoundingClientRect();
    setPlacement(placeAnchored({ top: a.top, left: a.left, width: a.width, height: a.height }, { width: p.width, height: p.height }, { width: window.innerWidth, height: window.innerHeight }));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-primary outline-none hover:bg-info-soft focus-visible:ring-[3px] focus-visible:ring-primary/35',
          open && 'bg-info-soft',
          className,
        )}
      >
        <Icon name={icon} className="!text-xl" />
      </button>
      {open
        ? inBody(
            <div
              ref={panelRef}
              id={id}
              role="dialog"
              aria-label={title}
              style={{ top: placement?.top ?? 0, left: placement?.left ?? 0, visibility: placement ? 'visible' : 'hidden' }}
              className="fixed z-[60] w-[min(320px,calc(100vw-16px))] rounded-xl border border-line bg-white p-4 shadow-[0_12px_32px_rgba(16,22,52,0.2)]"
            >
              <p className="text-[13px] font-bold text-ink">{title}</p>
              <div className="mt-1 text-sm whitespace-pre-line text-pretty text-body">{children}</div>
            </div>,
          )
        : null}
    </>
  );
}

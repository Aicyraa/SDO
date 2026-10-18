import { useId, useRef, useState, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';
import { Icon } from './Icon';
import { TooltipBubble } from './TooltipBubble';

const iconButtonVariants = cva(
  'inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      tone: {
        primary: 'border-primary bg-white text-primary hover:bg-primary-tint',
        neutral: 'border-line-strong bg-white text-ink hover:bg-page',
        danger: 'border-transparent text-muted hover:bg-danger-soft hover:text-danger',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

/** A round icon button whose name is also its tooltip (hover and keyboard focus). */
export function IconButton({
  icon,
  label,
  tone,
  className,
  ...rest
}: { icon: string; label: string } & VariantProps<typeof iconButtonVariants> & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children'>) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <span className="inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        ref={ref}
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        className={cn(iconButtonVariants({ tone }), className)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
        }}
        {...rest}
      >
        <Icon name={icon} className="!text-[20px]" />
      </button>
      {open ? <TooltipBubble anchor={ref} id={id} label={label} /> : null}
    </span>
  );
}

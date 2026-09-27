import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-[transform,background-color,border-color,color,box-shadow] duration-150 ease-out active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45';

const variants: Record<Variant, string> = {
  primary:
  'bg-tide-500 text-abyss-950 hover:bg-tide-400 shadow-[0_10px_30px_-12px_rgba(34,211,238,0.7)]',
  secondary:
  'border border-white/10 bg-white/[0.04] text-ink-100 hover:border-tide-500/40 hover:bg-tide-500/10 hover:text-white',
  ghost: 'text-ink-300 hover:bg-white/[0.06] hover:text-ink-100',
  danger: 'bg-signal-high text-white hover:bg-signal-high/85'
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-[15px]'
};

export function buttonStyles(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return <button className={buttonStyles(variant, size, className)} {...props} />;
}

interface ButtonLinkProps {
  to: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

export function ButtonLink({ to, variant = 'primary', size = 'md', className, children }: ButtonLinkProps) {
  return (
    <Link to={to} className={buttonStyles(variant, size, className)}>
      {children}
    </Link>);

}

export function IconButton({
  label,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {label: string;}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-abyss-800/80 text-ink-300 transition-[background-color,border-color,color] duration-150 ease-out hover:border-tide-500/40 hover:text-tide-500',
        className
      )}
      {...props}>
      
      {children}
    </button>);

}
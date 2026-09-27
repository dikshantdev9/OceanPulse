import React from 'react';
import { cn } from '../../utils/cn';

const control =
'w-full rounded-xl border border-white/10 bg-abyss-900/70 px-3.5 text-sm text-ink-100 placeholder:text-ink-500 transition-[border-color,box-shadow] duration-150 ease-out focus:border-tide-500/60 focus:outline-none focus:ring-2 focus:ring-tide-500/20';

export function Label({ htmlFor, children }: {htmlFor: string;children: React.ReactNode;}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-ink-300">
      {children}
    </label>);

}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, hint, error, icon, id, className, ...props }: InputProps) {
  const fieldId = id ?? props.name ?? label?.toLowerCase().replace(/\s+/g, '-') ?? 'field';
  return (
    <div className="w-full">
      {label ? <Label htmlFor={fieldId}>{label}</Label> : null}
      <div className="relative">
        {icon ?
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500">{icon}</span> :
        null}
        <input
          id={fieldId}
          aria-invalid={error ? true : undefined}
          className={cn(
            control,
            'h-11',
            icon && 'pl-10',
            error && 'border-signal-high/60 focus:border-signal-high/70 focus:ring-signal-high/20',
            className
          )}
          {...props} />
        
      </div>
      {error ?
      <p className="mt-1.5 text-xs font-medium text-signal-high">{error}</p> :
      hint ?
      <p className="mt-1.5 text-xs text-ink-500">{hint}</p> :
      null}
    </div>);

}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: {value: string;label: string;}[];
}

export function Select({ label, options, id, className, ...props }: SelectProps) {
  const fieldId = id ?? props.name ?? label?.toLowerCase().replace(/\s+/g, '-') ?? 'select';
  return (
    <div className="w-full">
      {label ? <Label htmlFor={fieldId}>{label}</Label> : null}
      <select id={fieldId} className={cn(control, 'h-11 appearance-none pr-9', className)} {...props}>
        {options.map((o) =>
        <option key={o.value} value={o.value} className="bg-abyss-900">
            {o.label}
          </option>
        )}
      </select>
    </div>);

}

export function Toggle({
  checked,
  onChange,
  label,
  description





}: {checked: boolean;onChange: (v: boolean) => void;label: string;description?: string;}) {
  return (
    <div className="flex items-start justify-between gap-6 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink-100">{label}</p>
        {description ? <p className="mt-0.5 text-xs text-ink-400">{description}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors duration-150 ease-out',
          checked ? 'border-tide-500/50 bg-tide-500/30' : 'border-white/10 bg-white/[0.06]'
        )}>
        
        <span
          className={cn(
            'absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-transform duration-150 ease-out',
            checked ? 'translate-x-6 bg-tide-500' : 'translate-x-1 bg-ink-500'
          )} />
        
      </button>
    </div>);

}
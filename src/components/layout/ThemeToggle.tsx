import React, { useState, useRef, useEffect } from 'react';
import { SunIcon, MoonIcon, LaptopIcon, CheckIcon } from 'lucide-react';
import { useTheme, type Theme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'dropdown' | 'segmented';
  size?: 'sm' | 'md';
}

export function ThemeToggle({
  className,
  variant = 'dropdown',
  size = 'md',
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const options: { value: Theme; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: 'light', label: 'Light', icon: SunIcon },
    { value: 'dark', label: 'Dark', icon: MoonIcon },
    { value: 'system', label: 'System', icon: LaptopIcon },
  ];

  if (variant === 'segmented') {
    return (
      <div
        className={cn(
          'inline-flex items-center rounded-xl border border-white/10 bg-abyss-900/80 p-1 backdrop-blur-md',
          className
        )}
        role="group"
        aria-label="Theme selection"
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              aria-pressed={isActive}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 ease-out',
                isActive
                  ? 'bg-tide-500/15 text-tide-400 shadow-sm ring-1 ring-tide-500/30'
                  : 'text-ink-400 hover:bg-white/[0.05] hover:text-ink-100'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode (Current: ${theme})`}
        className={cn(
          'relative flex items-center justify-center rounded-lg border border-white/10 text-ink-300 transition-colors duration-150 ease-out hover:border-tide-500/40 hover:text-tide-400',
          size === 'sm' ? 'h-8 w-8' : 'h-9 w-9',
          className
        )}
      >
        <span className="relative flex h-4 w-4 items-center justify-center">
          {resolvedTheme === 'dark' ? (
            <SunIcon className="h-4 w-4 rotate-0 transition-transform duration-300 ease-out" />
          ) : (
            <MoonIcon className="h-4 w-4 rotate-0 transition-transform duration-300 ease-out" />
          )}
        </span>
      </button>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Theme options"
        aria-expanded={open}
        title={`Theme: ${theme.toUpperCase()} (${resolvedTheme} active)`}
        className={cn(
          'relative flex items-center justify-center rounded-lg border transition-all duration-150 ease-out',
          open
            ? 'border-tide-500/40 bg-tide-500/10 text-tide-400'
            : 'border-white/10 text-ink-300 hover:border-tide-500/40 hover:text-tide-400',
          size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'
        )}
      >
        {resolvedTheme === 'dark' ? (
          <MoonIcon className="h-4 w-4" />
        ) : (
          <SunIcon className="h-4 w-4" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-36 overflow-hidden rounded-xl border border-white/[0.1] bg-abyss-850/95 p-1 shadow-panel backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
            Theme Mode
          </div>
          <div className="space-y-0.5">
            {options.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setTheme(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 ease-out',
                    isSelected
                      ? 'bg-tide-500/15 text-tide-400 font-semibold'
                      : 'text-ink-300 hover:bg-white/[0.06] hover:text-ink-100'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5" />
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && <CheckIcon className="h-3.5 w-3.5 text-tide-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

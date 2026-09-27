import React from 'react';
import { Link } from 'react-router-dom';
import { WavesIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Logo({
  to = '/',
  compact,
  className




}: {to?: string;compact?: boolean;className?: string;}) {
  return (
    <Link
      to={to}
      className={cn('group flex items-center gap-2.5', className)}
      aria-label="Ocean Pulse home">
      
      {compact ?
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-tide-500/12 text-tide-500 ring-1 ring-inset ring-tide-500/25 transition-colors duration-150 ease-out group-hover:bg-tide-500/20">
          <WavesIcon className="h-[18px] w-[18px]" />
        </span> :
      <img
        src="/ocean-pulse-logo.svg"
        alt="OceanPulse"
        className="h-11 w-40 shrink-0 object-fill"
      />}
    </Link>);

}
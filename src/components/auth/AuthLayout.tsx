import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon } from 'lucide-react';
import { assets } from '../../data/assets';
import { Logo } from '../layout/Logo';

const highlights = [
'Sentinel-1 SAR coverage across five monitored regions',
'AI slick segmentation with per-scene confidence scoring',
'AIS correlation and ranked suspect vessels per spill'];


export function AuthLayout({
  title,
  subtitle,
  children,
  footer





}: {title: string;subtitle: string;children: React.ReactNode;footer?: React.ReactNode;}) {
  return (
    <div className="flex min-h-screen w-full bg-abyss-950">
      {/* Brand panel */}
      <aside className="relative hidden w-[46%] shrink-0 overflow-hidden border-r border-white/[0.06] lg:block">
        <img
          src={assets.heroOrbit}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-40" />
        
        <div className="absolute inset-0 bg-gradient-to-br from-abyss-950/80 via-abyss-950/90 to-abyss-950" />
        <div className="grid-field absolute inset-0 opacity-35" aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Logo />
          <div>
            <h2 className="max-w-md text-[32px] font-semibold leading-tight tracking-tight text-white">
              The ocean is under watch, around the clock.
            </h2>
            <ul className="mt-8 space-y-3.5">
              {highlights.map((h) =>
              <li key={h} className="flex items-start gap-3 text-[13px] leading-relaxed text-ink-300">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-tide-500/15 text-tide-400">
                    <CheckIcon className="h-3 w-3" />
                  </span>
                  {h}
                </li>
              )}
            </ul>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-600">
            Detect. Track. Protect the ocean.
          </p>
        </div>
      </aside>

      {/* Form panel */}
      <div className="ocean-field flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-5 py-5 sm:px-8">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold text-ink-400 transition-colors duration-150 ease-out hover:text-ink-100">
            
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            Back to site
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-8">
          <div className="w-full max-w-[420px]">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[28px]">{title}</h1>
            <p className="mt-2 text-sm text-ink-400">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer ? <div className="mt-6 text-center text-[13px] text-ink-400">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>);

}
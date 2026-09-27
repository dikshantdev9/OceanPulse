import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MenuIcon, XIcon } from 'lucide-react';
import { ButtonLink } from '../ui/Button';
import { Logo } from '../layout/Logo';
import { ThemeToggle } from '../layout/ThemeToggle';

const links = [
{ label: 'How it works', href: '#how-it-works' },
{ label: 'Technology', href: '#technology' },
{ label: 'Impact', href: '#impact' }];


export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-abyss-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Sections">
          {links.map((l) =>
          <a
            key={l.href}
            href={l.href}
            className="rounded-lg px-3 py-2 text-[13px] font-medium text-ink-400 transition-colors duration-150 ease-out hover:bg-white/[0.05] hover:text-ink-100">
            
              {l.label}
            </a>
          )}
        </nav>
        <div className="ml-auto hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link
            to="/login"
            className="rounded-xl px-3 py-2 text-[13px] font-semibold text-ink-300 transition-colors duration-150 ease-out hover:text-white">
            
            Sign in
          </Link>
          <ButtonLink to="/app" size="sm">
            Explore dashboard
          </ButtonLink>
        </div>
        <div className="ml-auto flex items-center gap-2 md:hidden">
          <ThemeToggle size="sm" />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-ink-300 transition-colors duration-150 ease-out hover:text-tide-500">
            
            {open ? <XIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open ?
      <div className="border-t border-white/[0.06] bg-abyss-900/95 px-4 py-3 md:hidden">
          <ul className="space-y-1">
            {links.map((l) =>
          <li key={l.href}>
                <a
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-300 hover:bg-white/[0.05]">
              
                  {l.label}
                </a>
              </li>
          )}
          </ul>
          <div className="mt-3 flex gap-2">
            <ButtonLink to="/login" variant="secondary" size="sm" className="flex-1">
              Sign in
            </ButtonLink>
            <ButtonLink to="/app" size="sm" className="flex-1">
              Dashboard
            </ButtonLink>
          </div>
        </div> :
      null}
    </header>);

}
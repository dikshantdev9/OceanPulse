import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BellIcon, ChevronDownIcon, MenuIcon, SearchIcon, ShieldCheckIcon } from 'lucide-react';
import { alerts } from '../../data/alerts';
import { cn } from '../../utils/cn';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../../context/AuthContext';

export function TopBar({ onOpenMobileNav }: {onOpenMobileNav: () => void;}) {
  const [openPanel, setOpenPanel] = useState<'alerts' | 'user' | null>(null);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const unread = alerts.filter((a) => a.unread).length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/app/history');
  };

  const handleLogout = async () => {
    setOpenPanel(null);
    await logout();
    navigate('/login', { replace: true });
  };

  const displayName = user?.name || 'Anjali Kulkarni';
  const displayEmail = user?.email || 'anjali.k@marinewatch.gov';
  const displayRole = user?.role ? `${user.role.toUpperCase()} ANALYST` : 'AGENCY ANALYST';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'OP';

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-abyss-900/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-ink-300 transition-colors duration-150 ease-out hover:border-tide-500/40 hover:text-tide-500 lg:hidden">
          
          <MenuIcon className="h-4 w-4" />
        </button>

        <form onSubmit={submit} className="relative min-w-0 flex-1 max-w-xl" role="search">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search spill ID, MMSI, vessel or region…"
            aria-label="Search spills and vessels"
            className="h-10 w-full rounded-xl border border-white/[0.08] bg-abyss-850/80 pl-10 pr-3 text-sm text-ink-100 placeholder:text-ink-500 transition-[border-color,box-shadow] duration-150 ease-out focus:border-tide-500/50 focus:outline-none focus:ring-2 focus:ring-tide-500/15" />
          
        </form>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-xl border border-signal-low/25 bg-signal-low/[0.08] px-3 py-1.5 text-[11px] font-semibold text-signal-low xl:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-signal-low" />
            FEEDS LIVE
          </span>

          <ThemeToggle />

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenPanel((p) => p === 'alerts' ? null : 'alerts')}
              aria-label={`Notifications, ${unread} unread`}
              aria-expanded={openPanel === 'alerts'}
              className={cn(
                'relative flex h-9 w-9 items-center justify-center rounded-lg border transition-colors duration-150 ease-out',
                openPanel === 'alerts' ?
                'border-tide-500/40 bg-tide-500/10 text-tide-500' :
                'border-white/10 text-ink-300 hover:border-tide-500/40 hover:text-tide-500'
              )}>
              
              <BellIcon className="h-4 w-4" />
              {unread > 0 ?
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-signal-high px-1 font-mono text-[9px] font-bold text-white ring-2 ring-abyss-900">
                  {unread}
                </span> :
              null}
            </button>

            {openPanel === 'alerts' ?
            <div className="absolute right-0 top-11 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/[0.08] bg-abyss-850/95 shadow-panel backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                  <p className="text-sm font-semibold text-ink-100">Alert center</p>
                  <Link
                  to="/app/alerts"
                  onClick={() => setOpenPanel(null)}
                  className="text-xs font-semibold text-tide-500 hover:text-tide-400">
                  
                    View all
                  </Link>
                </div>
                <ul className="max-h-80 divide-y divide-white/[0.05] overflow-y-auto">
                  {alerts.slice(0, 4).map((a) =>
                <li key={a.id}>
                      <Link
                    to={a.actionTo}
                    onClick={() => setOpenPanel(null)}
                    className="flex gap-3 px-4 py-3 transition-colors duration-150 ease-out hover:bg-white/[0.04]">
                    
                        <span
                      className={cn(
                        'mt-1 h-2 w-2 shrink-0 rounded-full',
                        a.priority === 'HIGH' ?
                        'bg-signal-high' :
                        a.priority === 'MEDIUM' ?
                        'bg-signal-med' :
                        'bg-signal-info'
                      )} />
                    
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-semibold text-ink-100">{a.title}</span>
                          <span className="mt-0.5 block truncate text-xs text-ink-400">
                            {a.meta[0]?.value} · {a.time}
                          </span>
                        </span>
                      </Link>
                    </li>
                )}
                </ul>
              </div> :
            null}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenPanel((p) => p === 'user' ? null : 'user')}
              aria-expanded={openPanel === 'user'}
              className="flex items-center gap-2.5 rounded-xl border border-white/10 py-1.5 pl-1.5 pr-2.5 transition-colors duration-150 ease-out hover:border-tide-500/40">
              
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-tide-500/15 font-mono text-[11px] font-bold text-tide-400">
                {initials}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-semibold leading-tight text-ink-100">{displayName}</span>
                <span className="block text-[10px] leading-tight text-ink-500">{displayRole}</span>
              </span>
              <ChevronDownIcon className="hidden h-3.5 w-3.5 text-ink-500 sm:block" />
            </button>

            {openPanel === 'user' ?
            <div className="absolute right-0 top-12 w-60 overflow-hidden rounded-2xl border border-white/[0.08] bg-abyss-850/95 shadow-panel backdrop-blur-xl">
                <div className="border-b border-white/[0.06] px-4 py-3">
                  <p className="text-sm font-semibold text-ink-100">{displayName}</p>
                  <p className="mt-0.5 text-xs text-ink-500">{displayEmail}</p>
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-tide-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-tide-400">
                    <ShieldCheckIcon className="h-3 w-3" />
                    {displayRole}
                  </p>
                </div>
                <div className="p-1.5">
                  <Link
                    to="/app/settings"
                    onClick={() => setOpenPanel(null)}
                    className="block rounded-lg px-2.5 py-2 text-[13px] font-medium text-ink-300 transition-colors duration-150 ease-out hover:bg-white/[0.06] hover:text-ink-100">
                    Account settings
                  </Link>
                  <Link
                    to="/app/reports"
                    onClick={() => setOpenPanel(null)}
                    className="block rounded-lg px-2.5 py-2 text-[13px] font-medium text-ink-300 transition-colors duration-150 ease-out hover:bg-white/[0.06] hover:text-ink-100">
                    Reports
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-red-400 transition-colors duration-150 ease-out hover:bg-red-500/10 hover:text-red-300">
                    Sign out
                  </button>
                </div>
              </div> :
            null}
          </div>
        </div>
      </div>
    </header>);

}
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, LogOutIcon, XIcon } from 'lucide-react';
import { navEntries } from '../../data/navigation';
import { cn } from '../../utils/cn';
import { Logo } from './Logo';
import { NavIcon } from './NavIcon';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../../context/AuthContext';

const groups = ['Monitoring', 'Investigation', 'Workspace'] as const;

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    onCloseMobile();
    await logout();
    navigate('/login', { replace: true });
  };
  const nav =
  <nav className="flex h-full flex-col" aria-label="Main navigation">
      <div className={cn('flex items-center gap-2 px-4 py-5', collapsed && 'lg:justify-center lg:px-3')}>
        <Logo compact={collapsed} />
        <button
        type="button"
        onClick={onCloseMobile}
        aria-label="Close navigation"
        className="ml-auto rounded-lg p-1.5 text-ink-400 transition-colors duration-150 ease-out hover:bg-white/[0.06] hover:text-ink-100 lg:hidden">
        
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {groups.map((group) =>
      <div key={group} className="mb-5">
            {!collapsed ?
        <p className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-600">
                {group}
              </p> :

        <div className="mx-auto mb-2 h-px w-6 bg-white/10" aria-hidden="true" />
        }
            <ul className="space-y-0.5">
              {navEntries.
          filter((e) => e.group === group).
          map((entry) =>
          <li key={entry.to}>
                    <NavLink
              to={entry.to}
              end={entry.to === '/app'}
              onClick={onCloseMobile}
              title={collapsed ? entry.label : undefined}
              className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-[background-color,color] duration-150 ease-out',
                collapsed && 'lg:justify-center',
                isActive ?
                'bg-tide-500/[0.12] text-white' :
                'text-ink-400 hover:bg-white/[0.05] hover:text-ink-100'
              )
              }>
              
                      {({ isActive }) =>
              <>
                          {isActive ?
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-tide-500" /> :
                null}
                          <NavIcon
                  name={entry.icon}
                  className={cn('h-4 w-4 shrink-0', isActive ? 'text-tide-500' : '')} />
                
                          {!collapsed ? <span className="truncate">{entry.label}</span> : null}
                          {entry.badge && !collapsed ?
                <span className="ml-auto rounded-full bg-signal-high/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-signal-high">
                              {entry.badge}
                            </span> :
                null}
                        </>
              }
                    </NavLink>
                  </li>
          )}
            </ul>
          </div>
      )}
      </div>

      <div className="border-t border-white/[0.06] p-3">
        {!collapsed ?
      <div className="mb-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-600">Model build</p>
            <p className="mt-1 font-mono text-xs font-semibold text-ink-200">SAR-UNet v4.2.1</p>
            <p className="mt-1 text-[11px] text-ink-500">Last sync 4 min ago</p>
          </div> :
      null}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              'flex flex-1 items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium text-ink-400 transition-colors duration-150 ease-out hover:bg-red-500/10 hover:text-red-400',
              collapsed && 'lg:justify-center'
            )}>
            <LogOutIcon className="h-4 w-4 shrink-0" />
            {!collapsed ? 'Sign out' : null}
          </button>
          <ThemeToggle variant="icon" size="sm" />
          <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-ink-400 transition-colors duration-150 ease-out hover:border-tide-500/40 hover:text-tide-500 lg:flex">
          
            <ChevronLeftIcon className={cn('h-4 w-4 transition-transform duration-200 ease-out', collapsed && 'rotate-180')} />
          </button>
        </div>
      </div>
    </nav>;


  return (
    <>
      {/* Desktop rail */}
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 border-r border-white/[0.06] bg-abyss-900/80 backdrop-blur-xl transition-[width] duration-200 ease-out lg:block',
          collapsed ? 'w-[76px]' : 'w-[248px]'
        )}>
        
        {nav}
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        aria-hidden={!mobileOpen}>
        
        <div
          onClick={onCloseMobile}
          className={cn(
            'absolute inset-0 bg-abyss-950/75 transition-opacity duration-200 ease-out',
            mobileOpen ? 'opacity-100' : 'opacity-0'
          )} />
        
        <div
          className={cn(
            'absolute inset-y-0 left-0 w-[268px] border-r border-white/[0.07] bg-abyss-900 transition-transform duration-200 ease-out',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}>
          
          {nav}
        </div>
      </div>
    </>);

}
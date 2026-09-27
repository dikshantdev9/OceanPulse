import React from 'react';
import { NavLink } from 'react-router-dom';
import { mobileNavEntries } from '../../data/navigation';
import { cn } from '../../utils/cn';
import { NavIcon } from './NavIcon';

export function MobileNav() {
  return (
    <nav
      aria-label="Primary sections"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.07] bg-abyss-900/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      
      <ul className="grid grid-cols-5">
        {mobileNavEntries.map((entry) =>
        <li key={entry.to}>
            <NavLink
            to={entry.to}
            end={entry.to === '/app'}
            className={({ isActive }) =>
            cn(
              'relative flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors duration-150 ease-out',
              isActive ? 'text-tide-400' : 'text-ink-500'
            )
            }>
            
              {({ isActive }) =>
            <>
                  {isActive ?
              <span className="absolute top-0 h-0.5 w-8 rounded-full bg-tide-500" /> :
              null}
                  <span className="relative">
                    <NavIcon name={entry.icon} className="h-[18px] w-[18px]" />
                    {entry.badge ?
                <span className="absolute -right-1.5 -top-1 h-1.5 w-1.5 rounded-full bg-signal-high" /> :
                null}
                  </span>
                  <span className="max-w-[68px] truncate">{entry.label.split(' ')[0]}</span>
                </>
            }
            </NavLink>
          </li>
        )}
      </ul>
    </nav>);

}
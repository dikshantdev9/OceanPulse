import React from 'react';
import { BuildingIcon, MicroscopeIcon, ShieldIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export type Role = 'researcher' | 'agency' | 'admin';

const roles: {id: Role;label: string;hint: string;icon: React.ComponentType<{className?: string;}>;}[] = [
{ id: 'researcher', label: 'Researcher', hint: 'Read-only imagery & analytics', icon: MicroscopeIcon },
{ id: 'agency', label: 'Environmental Agency', hint: 'Investigate & file reports', icon: BuildingIcon },
{ id: 'admin', label: 'Administrator', hint: 'Manage models, users & feeds', icon: ShieldIcon }];


export function RolePicker({ value, onChange }: {value: Role;onChange: (r: Role) => void;}) {
  return (
    <fieldset>
      <legend className="mb-1.5 block text-xs font-semibold text-ink-300">Role</legend>
      <div className="space-y-2">
        {roles.map((r) => {
          const active = value === r.id;
          return (
            <label
              key={r.id}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition-[border-color,background-color] duration-150 ease-out',
                active ?
                'border-tide-500/50 bg-tide-500/[0.08]' :
                'border-white/[0.08] bg-abyss-900/60 hover:border-white/20'
              )}>
              
              <input
                type="radio"
                name="role"
                value={r.id}
                checked={active}
                onChange={() => onChange(r.id)}
                className="sr-only" />
              
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  active ? 'bg-tide-500/20 text-tide-400' : 'bg-white/[0.05] text-ink-400'
                )}>
                
                <r.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-ink-100">{r.label}</span>
                <span className="block text-[11px] text-ink-500">{r.hint}</span>
              </span>
              <span
                className={cn(
                  'ml-auto h-4 w-4 shrink-0 rounded-full border transition-colors duration-150 ease-out',
                  active ? 'border-tide-500 bg-tide-500/80' : 'border-white/20'
                )} />
              
            </label>);

        })}
      </div>
    </fieldset>);

}
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { VisibleSettingsCategory } from '../_lib/settings-categories';

export interface SettingsCategoryNavProps {
  categories: readonly VisibleSettingsCategory[];
  activeSlug: string | null;
  className?: string;
}

export function SettingsCategoryNav({
  categories,
  activeSlug,
  className,
}: SettingsCategoryNavProps) {
  const router = useRouter();

  if (categories.length === 0) {
    return null;
  }

  return (
    <>
      <nav
        aria-label="Submenu de configurações"
        className={cn('hidden lg:block', className)}
      >
        <ul role="list" className="space-y-1">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeSlug === category.slug;
            const baseClasses =
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

            if (category.locked) {
              return (
                <li key={category.id}>
                  <span
                    aria-disabled="true"
                    aria-current={isActive ? 'page' : undefined}
                    data-settings-nav-locked="true"
                    className={cn(
                      baseClasses,
                      'cursor-not-allowed text-muted-foreground opacity-70',
                      isActive && 'bg-muted font-medium',
                    )}
                    title={category.lockReason}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    <span className="flex-1">{category.title}</span>
                    <Lock className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </li>
              );
            }

            return (
              <li key={category.id}>
                <Link
                  href={category.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    baseClasses,
                    'text-foreground hover:bg-muted',
                    isActive && 'bg-muted font-medium',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span className="flex-1">{category.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={cn('lg:hidden', className)}>
        <label htmlFor="settings-mobile-nav" className="sr-only">
          Navegar para uma categoria de configuração
        </label>
        <Select
          value={activeSlug ?? ''}
          onValueChange={(value) => {
            if (!value) return;
            const target = categories.find((category) => category.slug === value);
            if (target && !target.locked) {
              router.push(target.href);
            }
          }}
        >
          <SelectTrigger id="settings-mobile-nav" className="w-full">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem
                key={category.id}
                value={category.slug}
                disabled={category.locked}
              >
                {category.locked ? `${category.title} (bloqueado)` : category.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

export default SettingsCategoryNav;
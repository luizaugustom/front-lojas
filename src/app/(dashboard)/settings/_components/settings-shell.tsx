'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home, Lock, Settings as SettingsIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useCompany } from '@/hooks/useCompany';
import type { UserRole } from '@/types';
import {
  getSettingsCategories,
  getAllSettingsCategories,
  isUserRole,
  toCompanySnapshot,
  type SettingsCategory,
  type SettingsCategoryId,
  type VisibleSettingsCategory,
} from '../_lib/settings-categories';
import { SettingsCategoryNav } from './settings-category-nav';

const isSettingsCategoryId = (value: string): value is SettingsCategoryId =>
  getAllSettingsCategories().some((category) => category.id === value);

const findCategoryBySlug = (
  slug: string,
): SettingsCategory | undefined =>
  getAllSettingsCategories().find((category) => category.slug === slug);

export interface SettingsShellProps {
  children: React.ReactNode;
}

export function SettingsShell({ children }: SettingsShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { company, loading: companyLoading } = useCompany();

  const role: UserRole | null = isUserRole(user?.role) ? user.role : null;
  const isEmpresa = role === 'empresa';

  const segments = useMemo(() => {
    if (!pathname) return [];
    return pathname.split('/').filter(Boolean);
  }, [pathname]);

  const isHub = segments.length === 1 && segments[0] === 'settings';

  const subSlug = !isHub && segments.length >= 2 ? segments[1] : null;
  const knownSlug = subSlug !== null && isSettingsCategoryId(subSlug) ? subSlug : null;

  useEffect(() => {
    if (isHub) return;
    if (subSlug === null) {
      router.replace('/settings');
      return;
    }
    if (knownSlug === null) {
      router.replace('/settings');
    }
  }, [isHub, knownSlug, subSlug, router]);

  const categories: VisibleSettingsCategory[] =
    role === null
      ? []
      : getSettingsCategories(role, toCompanySnapshot(company));

  const activeCategory: SettingsCategory | null =
    knownSlug !== null ? (findCategoryBySlug(knownSlug) ?? null) : null;

  const visibleActive: VisibleSettingsCategory | null = (() => {
    if (!activeCategory) return null;
    return categories.find((category) => category.id === activeCategory.id) ?? null;
  })();

  if (isHub) {
    return <>{children}</>;
  }

  if (subSlug === null || knownSlug === null) {
    return null;
  }

  if (!visibleActive) {
    return (
      <Alert className="border-muted bg-muted/40">
        <Lock className="h-4 w-4" aria-hidden />
        <AlertTitle>Categoria indisponível</AlertTitle>
        <AlertDescription>
          Esta categoria não está disponível para o seu perfil.
        </AlertDescription>
        <Button asChild className="mt-3 w-fit">
          <Link href="/settings">Voltar para Configurações</Link>
        </Button>
      </Alert>
    );
  }

  if (visibleActive.locked) {
    return (
      <Alert className="border-destructive/40 bg-destructive/5">
        <Lock className="h-4 w-4 text-destructive" aria-hidden />
        <AlertTitle>{visibleActive.title} bloqueado</AlertTitle>
        <AlertDescription>
          {visibleActive.lockReason ?? 'Esta categoria está bloqueada para a sua empresa.'}
        </AlertDescription>
        <Button asChild className="mt-3 w-fit">
          <Link href="/settings">Voltar para Configurações</Link>
        </Button>
      </Alert>
    );
  }

  if (isEmpresa && companyLoading && !company) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Carregando configurações"
        className="space-y-4"
      >
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <section aria-labelledby="settings-shell-title" className="space-y-4">
      <nav aria-label="Trilha de navegação" className="text-sm">
        <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
          <li className="flex items-center gap-1">
            <Link
              href="/settings"
              className="inline-flex items-center gap-1 rounded outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:text-foreground"
            >
              <Home className="h-3.5 w-3.5" aria-hidden />
              <span>Configurações</span>
            </Link>
          </li>
          <li aria-hidden className="flex items-center">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li className="font-medium text-foreground" aria-current="page">
            <span className="inline-flex items-center gap-1">
              <SettingsIcon className="h-3.5 w-3.5" aria-hidden />
              <span>{visibleActive.title}</span>
            </span>
          </li>
        </ol>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
        <aside aria-label="Navegação local de configurações">
          <SettingsCategoryNav
            categories={categories}
            activeSlug={visibleActive.slug}
          />
        </aside>

        <div>
          <header className="mb-4 space-y-1">
            <h1
              id="settings-shell-title"
              className="text-2xl font-semibold tracking-tight"
            >
              {visibleActive.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {visibleActive.description}
            </p>
          </header>
          {children}
        </div>
      </div>
    </section>
  );
}

export default SettingsShell;
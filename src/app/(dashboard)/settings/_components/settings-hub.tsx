'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, HelpCircle, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHelpModal } from '@/components/help';
import {
  settingsHelpTitle,
  settingsHelpDescription,
  settingsHelpIcon,
  getSettingsHelpTabs,
} from '@/components/help/contents/settings-help';
import { useAuth } from '@/hooks/useAuth';
import { useCompany } from '@/hooks/useCompany';
import type { UserRole } from '@/types';
import {
  getSettingsCategories,
  isUserRole,
  toCompanySnapshot,
  type VisibleSettingsCategory,
} from '../_lib/settings-categories';

export function SettingsHub() {
  const { user } = useAuth();
  const { company, loading: companyLoading } = useCompany();
  const [helpOpen, setHelpOpen] = useState(false);

  const role: UserRole | null = isUserRole(user?.role) ? user.role : null;
  const isEmpresa = role === 'empresa';
  const showLoadingSkeleton = isEmpresa && companyLoading;

  const categories: VisibleSettingsCategory[] =
    role === null
      ? []
      : getSettingsCategories(role, toCompanySnapshot(company));

  return (
    <section aria-labelledby="settings-hub-title" className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <SettingsIcon
              className="h-6 w-6 text-muted-foreground"
              aria-hidden
            />
            <h1
              id="settings-hub-title"
              className="text-2xl font-semibold tracking-tight"
            >
              Configurações
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Gerencie perfil, empresa, fiscal, catálogo e demais recursos da sua conta.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setHelpOpen(true)}
          aria-label="Ajuda das configurações"
          className="self-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <HelpCircle className="mr-2 h-4 w-4" aria-hidden />
          Ajuda
        </Button>
      </header>

      {showLoadingSkeleton ? (
        <div
          role="status"
          aria-live="polite"
          aria-label="Carregando configurações"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={`skeleton-${index}`} aria-hidden>
              <CardHeader className="space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          Nenhuma categoria de configuração disponível para o seu perfil.
        </p>
      ) : (
        <ul
          role="list"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            const { locked, lockReason, href, title, description, id } = category;

            const cardInner = (
              <>
                <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                  <div
                    className="rounded-md bg-muted p-2"
                    aria-hidden
                  >
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span>{title}</span>
                      {locked ? (
                        <Lock
                          className="h-4 w-4 text-muted-foreground"
                          aria-hidden
                        />
                      ) : null}
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </div>
                </CardHeader>
                {locked && lockReason ? (
                  <CardContent>
                    <p className="text-xs text-muted-foreground">{lockReason}</p>
                  </CardContent>
                ) : null}
              </>
            );

            return (
              <li
                key={id}
                data-settings-card
                data-locked={locked ? 'true' : 'false'}
                className="list-none"
              >
                {locked ? (
                  <Card
                    tabIndex={0}
                    aria-disabled="true"
                    className="h-full cursor-not-allowed opacity-80 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label={`${title} bloqueado: ${lockReason ?? ''}`}
                  >
                    {cardInner}
                  </Card>
                ) : (
                  <Link
                    href={href}
                    className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Card className="h-full transition hover:border-primary hover:shadow-md">
                      {cardInner}
                    </Card>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <PageHelpModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title={settingsHelpTitle}
        description={settingsHelpDescription}
        icon={settingsHelpIcon}
        tabs={getSettingsHelpTabs()}
      />
    </section>
  );
}

export default SettingsHub;
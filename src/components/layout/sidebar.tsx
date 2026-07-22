'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { companyApi } from '@/lib/api-endpoints';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui-store';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { getVisibleNavigation } from './sidebar-navigation';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
  const { user } = useAuth();

  const { data: companyData } = useQuery({
    queryKey: ['my-company-sidebar', user?.companyId],
    queryFn: async () => {
      const res = await companyApi.myCompany();
      return res.data as { boletoAllowed?: boolean; boletoEnabled?: boolean };
    },
    enabled: !!user && (user.role === 'empresa' || user.role === 'vendedor'),
  });
  const boletoEnabled = companyData?.boletoAllowed === true && companyData?.boletoEnabled === true;

  const filteredNavigation = getVisibleNavigation(user, boletoEnabled);
  

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 transform border-r bg-card transition-all duration-300 ease-in-out lg:translate-x-0',
          // Largura dinâmica no desktop
          sidebarCollapsed ? 'w-16' : 'w-64',
          // Drawer no mobile
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="navigation"
        aria-label="Menu principal"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b px-3">
            <Link href="/dashboard" className="flex items-center gap-3">
              {!sidebarCollapsed && (
                <Image 
                  src="/logo.png" 
                  alt="Montshop Logo" 
                  width={24} 
                  height={24} 
                  className="h-6 w-6"
                />
              )}
              {!sidebarCollapsed && <span className="text-lg font-bold dark:text-foreground">Montshop</span>}
            </Link>
            <div className="flex items-center gap-1">
              {/* Toggle collapse (desktop) */}
              <button
                onClick={toggleSidebarCollapsed}
                title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
                className="hidden lg:inline-flex items-center justify-center p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
                aria-label={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </button>

              {/* Fechar drawer (mobile) */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="inline-flex lg:hidden items-center justify-center p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
                title="Fechar menu"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className={cn('flex-1 space-y-1 overflow-y-auto', sidebarCollapsed ? 'p-2' : 'p-4')} role="navigation" aria-label="Menu de navegação">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center rounded-lg py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                  {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
                  {sidebarCollapsed && (
                    <span className="sr-only">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          {user && !sidebarCollapsed && (
            <div className="border-t p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {(
                    (user.name && user.name.length > 0 && user.name.charAt(0)) ||
                    (user.email && user.email.length > 0 && user.email.charAt(0)) ||
                    (user.login && user.login.length > 0 && user.login.charAt(0)) ||
                    '?'
                  ).toString().toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium dark:text-foreground">{user.name || user.email || user.login || 'Usuário'}</p>
                  <p className="truncate text-xs text-muted-foreground dark:text-muted-foreground capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

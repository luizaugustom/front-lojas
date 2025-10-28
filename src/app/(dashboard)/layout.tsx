'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/sidebar';
import { useUIStore } from '@/store/ui-store';
import { Header } from '@/components/layout/header';
import { PrinterStatusMonitor } from '@/components/printer/printer-status-monitor';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { sidebarCollapsed } = useUIStore();

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('[DashboardLayout] Usuário não autenticado, redirecionando para login');
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className={sidebarCollapsed ? 'flex flex-1 flex-col overflow-hidden lg:pl-16' : 'flex flex-1 flex-col overflow-hidden lg:pl-64'}>
        <Header />
        <main 
          className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6"
          role="main"
          aria-label="Conteúdo principal"
        >
          {children}
        </main>
      </div>
      {/* Monitor de Status de Impressoras */}
      <PrinterStatusMonitor />
    </div>
  );
}

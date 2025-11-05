'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/sidebar';
import { useUIStore } from '@/store/ui-store';
import { Header } from '@/components/layout/header';
import { TrialConversionModal } from '@/components/trial/trial-conversion-modal';
import { PlanType } from '@/types';
import { getAuthToken, getUser } from '@/lib/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { sidebarCollapsed } = useUIStore();
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  

  // Aguardar inicialização do estado do contexto antes de verificar autenticação
  useEffect(() => {
    // Verificar se há dados no localStorage (pode indicar que ainda está inicializando)
    const storedToken = getAuthToken();
    const storedUser = getUser();
    
    if (storedToken && storedUser) {
      // Dar um tempo para o contexto inicializar do localStorage
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    // Não redirecionar enquanto estiver inicializando
    if (isInitializing) return;
    
    if (!isAuthenticated) {
      console.log('[DashboardLayout] Usuário não autenticado, redirecionando para login');
      router.replace('/login');
    }
  }, [isAuthenticated, isInitializing, router]);

  // Verificar se deve mostrar o modal de conversão do plano TRIAL
  useEffect(() => {
    if (isAuthenticated && user) {
      // Verificar se o usuário tem plano TRIAL e se já não foi mostrado hoje
      const hideUntil = localStorage.getItem('trialModalHideUntil');
      if (hideUntil) {
        const hideUntilDate = new Date(hideUntil);
        const now = new Date();
        if (hideUntilDate > now) {
          return;
        }
      }

      // Mostrar modal se for empresa com plano TRIAL_7_DAYS
      if (
        user.role === 'empresa' &&
        user.plan === PlanType.TRIAL_7_DAYS
      ) {
        // Aguardar um pouco antes de mostrar o modal para dar tempo da página carregar
        const timer = setTimeout(() => {
          setShowTrialModal(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, user]);

  // Mostrar nada enquanto inicializa ou não estiver autenticado
  if (isInitializing || !isAuthenticated) {
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
      {/* Modal de Conversão do Plano TRIAL */}
      {user?.plan === PlanType.TRIAL_7_DAYS && (
        <TrialConversionModal
          open={showTrialModal}
          onOpenChange={setShowTrialModal}
          plan={user.plan}
        />
      )}
    </div>
  );
}

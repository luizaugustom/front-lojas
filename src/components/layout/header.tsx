'use client';

import { Menu, Moon, Sun, LogOut, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store/ui-store';
import { useAuth } from '@/hooks/useAuth';
import { PromotionalEmailDialog } from '@/components/promotional-email-dialog';

export function Header() {
  const router = useRouter();
  const { theme, toggleTheme, toggleSidebar } = useUIStore();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Redireciona para login após logout bem-sucedido
      router.push('/login');
    } catch (error) {
      console.error('Erro durante logout:', error);
      // Mesmo com erro, redireciona para login para garantir que o usuário seja deslogado
      router.push('/login');
    }
  };

  return (
    <header 
      className="sticky top-0 z-30 flex h-16 items-center gap-2 sm:gap-4 border-b bg-background px-2 sm:px-4 lg:px-6"
      role="banner"
    >
      <Button 
        variant="ghost" 
        size="icon" 
        className="lg:hidden focus:ring-2 focus:ring-primary focus:ring-offset-2" 
        onClick={toggleSidebar}
        aria-label="Abrir menu de navegação"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>

      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        <div className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
          {user?.name || 'Mont Softwares'}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Botão de Email Promocional - apenas para empresas */}
        {user?.role === 'empresa' && (
          <PromotionalEmailDialog>
            <Button 
              variant="ghost" 
              size="icon" 
              title="Email Promocional"
              className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Enviar email promocional"
            >
              <Mail className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </Button>
          </PromotionalEmailDialog>
        )}

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          ) : (
            <Sun className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          )}
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleLogout}
          className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Sair da aplicação"
        >
          <LogOut className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}

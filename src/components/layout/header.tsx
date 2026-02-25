'use client';

import { Menu, Moon, Sun, LogOut, Megaphone, CalendarRange } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store/ui-store';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { AdminBroadcastDialog } from '@/components/admin-broadcast-dialog';
import { DateRangeModal } from '@/components/date-range/DateRangeModal';
import { NotesButton } from '@/components/notes/NotesButton';
import { ContactsButton } from '@/components/contacts/ContactsButton';
import { CalendarButton } from '@/components/calendar/CalendarButton';
import { companyApi } from '@/lib/api-endpoints';
import { getImageUrl } from '@/lib/image-utils';
import { logger } from '@/lib/logger';

export function Header() {
  const router = useRouter();
  const { theme, toggleTheme, toggleSidebar } = useUIStore();
  const { logout, user } = useAuth();
  const passthroughLoader = ({ src }: { src: string }) => src;

  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
  const [dateRangeModalOpen, setDateRangeModalOpen] = useState(false);

  useEffect(() => {
    async function fetchCompanyLogo() {
      logger.log('🔍 [Header] Verificando usuário:', { 
        user, 
        companyId: user?.companyId, 
        role: user?.role,
        isCompany: user?.role === 'empresa',
        isSeller: user?.role === 'vendedor'
      });
      
      if (user?.companyId && (user.role === 'empresa' || user.role === 'vendedor')) {
        try {
          logger.log('🔍 [Header] Buscando logo da empresa...', { companyId: user.companyId, role: user.role });
          const response = await companyApi.myCompany();
          logger.log('🔍 [Header] Resposta completa da API:', JSON.stringify(response, null, 2));
          
          // response é um AxiosResponse, precisa acessar data
          const logoUrl = response.data?.logoUrl;
          
          logger.log('🔍 [Header] Logo recebido:', logoUrl, 'tipo:', typeof logoUrl);
          logger.log('🔍 [Header] Estrutura da resposta:', {
            responseKeys: response.data ? Object.keys(response.data) : [],
            hasLogoUrl: !!logoUrl
          });
          
          if (logoUrl && logoUrl.trim() !== '' && logoUrl !== 'null' && logoUrl !== 'undefined') {
            logger.log('🔍 [Header] ✅ Logo válido encontrado');
            setCompanyLogoUrl(logoUrl);
          } else {
            logger.log('🔍 [Header] ❌ Logo inválido ou vazio');
            setCompanyLogoUrl(null);
          }
        } catch (err) {
          logger.error('🔍 [Header] Erro ao buscar logo da empresa:', err);
          setCompanyLogoUrl(null);
        }
      } else {
        logger.log('🔍 [Header] Usuário não é empresa/vendedor ou não tem companyId:', { 
          hasCompanyId: !!user?.companyId,
          role: user?.role 
        });
        setCompanyLogoUrl(null);
      }
    }
    fetchCompanyLogo();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      // Redireciona após o logout
      router.push('/login');
    } catch (error) {
      logger.error('Erro durante logout:', error);
      // Mesmo com erro, redireciona para login
      router.push('/login');
    }
  };

  return (
    <header 
      className="sticky top-0 z-30 flex h-16 items-center justify-between gap-2 sm:gap-4 border-b bg-background"
      role="banner"
    >
      {/* Container dos botões do lado esquerdo com padding igual ao lado direito */}
      <div className="flex items-center gap-2 sm:gap-4 px-2 sm:px-4 lg:px-6">
        {/* Botão de menu (apenas mobile) */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden focus:ring-2 focus:ring-primary focus:ring-offset-2" 
          onClick={toggleSidebar}
          aria-label="Abrir menu de navegação"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>

        {/* Espaço vazio no desktop para compensar o botão de menu no mobile */}
        <div className="hidden lg:block w-10"></div>

        {/* Botão de contatos (lado esquerdo) - empresa e vendedor */}
        <ContactsButton />
        {/* Botão de anotações (lado esquerdo) - empresa e vendedor */}
        <NotesButton />
        {/* Botão de agenda (lado esquerdo) - empresa e vendedor */}
        <CalendarButton />
      </div>

      {/* Logomarca centralizada */}
      <div className="flex items-center justify-center flex-1 min-w-0">
        {companyLogoUrl && companyLogoUrl.trim() !== '' && companyLogoUrl !== 'null' && companyLogoUrl !== 'undefined' ? (
          <div className="relative flex items-center justify-center h-14 w-full max-w-[250px]">
            <Image
              src={getImageUrl(companyLogoUrl)}
              alt="Logomarca da empresa"
              className="object-contain"
              fill
              sizes="250px"
              unoptimized
              loader={passthroughLoader}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                logger.error('🔍 [Header] Erro ao carregar imagem:', {
                  src: target.src,
                  originalUrl: companyLogoUrl
                });
                setCompanyLogoUrl(null);
              }}
              onLoadingComplete={() => logger.log('🔍 [Header] Imagem carregada com sucesso:', getImageUrl(companyLogoUrl))}
            />
          </div>
        ) : (
          <div className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
            {user?.fantasyName || user?.name || 'Montshop'}
          </div>
        )}
      </div>

      {/* Botões alinhados à direita */}
      <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 lg:px-6">
        {/* Notificações */}
        <NotificationBell />

        {/* Botão de Broadcast - apenas para admins */}
        {user?.role === 'admin' && (
          <AdminBroadcastDialog>
            <Button 
              variant="ghost" 
              size="icon" 
              title="Enviar Novidades do Sistema"
              className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Enviar novidades do sistema"
            >
              <Megaphone className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </Button>
          </AdminBroadcastDialog>
        )}

        {/* Botão de filtro de data */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setDateRangeModalOpen(true)}
          className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Filtrar por período de datas"
          title="Filtrar dados por período"
        >
          <CalendarRange className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        </Button>

        {/* Botão de tema */}
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

        {/* Botão de logout */}
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

      {/* Modal de filtro de data */}
      <DateRangeModal open={dateRangeModalOpen} onOpenChange={setDateRangeModalOpen} />
    </header>
  );
}

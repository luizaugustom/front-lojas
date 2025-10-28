'use client';

import { Menu, Moon, Sun, LogOut, RefreshCw, Megaphone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store/ui-store';
import { useDeviceStore } from '@/store/device-store';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { AdminBroadcastDialog } from '@/components/admin-broadcast-dialog';
import { companyApi } from '@/lib/api-endpoints';
import { getImageUrl } from '@/lib/image-utils';
import { checkPrinterStatus } from '@/lib/printer-check';
import { toast } from 'react-hot-toast';

export function Header() {
  const router = useRouter();
  const { theme, toggleTheme, toggleSidebar } = useUIStore();
  const { logout, user, api } = useAuth();
  const { barcodeBuffer, scanSuccess, printerStatus, printerName } = useDeviceStore();

  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
  const [checkingPrinter, setCheckingPrinter] = useState(false);

  useEffect(() => {
    async function fetchCompanyLogo() {
      console.log('🔍 [Header] Verificando usuário:', { 
        user, 
        companyId: user?.companyId, 
        role: user?.role,
        isCompany: user?.role === 'empresa' || user?.role === 'company',
        isSeller: user?.role === 'vendedor' || user?.role === 'seller'
      });
      
      if (user?.companyId && (user.role === 'empresa' || user.role === 'vendedor' || user.role === 'company' || user.role === 'seller')) {
        try {
          console.log('🔍 [Header] Buscando logo da empresa...', { companyId: user.companyId, role: user.role });
          const response = await companyApi.myCompany();
          console.log('🔍 [Header] Resposta completa da API:', JSON.stringify(response, null, 2));
          
          // fixedCompanyMyCompany retorna response.data diretamente, então response já é os dados
          const logoUrl = response?.logoUrl;
          
          console.log('🔍 [Header] Logo recebido:', logoUrl, 'tipo:', typeof logoUrl);
          console.log('🔍 [Header] Estrutura da resposta:', {
            responseKeys: response ? Object.keys(response) : [],
            hasLogoUrl: !!logoUrl
          });
          
          if (logoUrl && logoUrl.trim() !== '' && logoUrl !== 'null' && logoUrl !== 'undefined') {
            console.log('🔍 [Header] ✅ Logo válido encontrado');
            setCompanyLogoUrl(logoUrl);
          } else {
            console.log('🔍 [Header] ❌ Logo inválido ou vazio');
            setCompanyLogoUrl(null);
          }
        } catch (err) {
          console.error('🔍 [Header] Erro ao buscar logo da empresa:', err);
          setCompanyLogoUrl(null);
        }
      } else {
        console.log('🔍 [Header] Usuário não é empresa/vendedor ou não tem companyId:', { 
          hasCompanyId: !!user?.companyId,
          role: user?.role 
        });
        setCompanyLogoUrl(null);
      }
    }
    fetchCompanyLogo();
  }, [user?.companyId, user?.role]);

  const handleLogout = async () => {
    try {
      await logout();
      // Redireciona após o logout
      router.push('/login');
    } catch (error) {
      console.error('Erro durante logout:', error);
      // Mesmo com erro, redireciona para login
      router.push('/login');
    }
  };

  const handleCheckPrinter = async () => {
    setCheckingPrinter(true);
    try {
      toast.loading('Verificando impressoras...', { id: 'printer-check' });
      const result = await checkPrinterStatus();
      
      if (result.success) {
        toast.success(result.message, { id: 'printer-check' });
      } else {
        toast.error(result.message, { id: 'printer-check' });
      }
    } catch (error) {
      console.error('Erro ao verificar impressoras:', error);
      toast.error('Erro ao verificar impressoras', { id: 'printer-check' });
    } finally {
      setCheckingPrinter(false);
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

      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 justify-center">
        {/* Logomarca centralizada se existir */}
        {companyLogoUrl && companyLogoUrl.trim() !== '' && companyLogoUrl !== 'null' && companyLogoUrl !== 'undefined' ? (
          <div className="relative flex items-center justify-center h-[98%] w-[30%] max-w-[200px] mx-auto">
            {console.log('🔍 [Header] Renderizando logo:', { companyLogoUrl, fullUrl: getImageUrl(companyLogoUrl) })}
            <img
              src={getImageUrl(companyLogoUrl)}
              alt="Logomarca da empresa"
              className="h-full w-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                console.error('🔍 [Header] Erro ao carregar imagem:', {
                  src: target.src,
                  originalUrl: companyLogoUrl
                });
                setCompanyLogoUrl(null);
              }}
              onLoad={() => console.log('🔍 [Header] Imagem carregada com sucesso:', getImageUrl(companyLogoUrl))}
            />
          </div>
        ) : (
          <div className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
            {user?.name || 'MontShop'}
          </div>
        )}
      </div>

      {/* Device Status Indicators - Discreet */}
      <div className="hidden sm:flex items-center gap-2 mr-2">
        {/* Scanner Status */}
        <div 
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${
            scanSuccess 
              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
              : barcodeBuffer 
                ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
          }`}
          title={scanSuccess ? 'Código lido' : barcodeBuffer ? `Lendo: ${barcodeBuffer.length} chars` : 'Scanner aguardando'}
        >
          <span className="text-[10px]">📱</span>
        </div>

        {/* Printer Status */}
        <div 
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${
            printerStatus === 'connected' 
              ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
              : printerStatus === 'checking'
                ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                : printerStatus === 'error'
                  ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
          }`}
          title={
            printerStatus === 'connected' 
              ? `Impressora: ${printerName || 'Conectada'}` 
              : printerStatus === 'checking'
                ? 'Verificando impressora'
                : printerStatus === 'error'
                  ? 'Impressora com erro'
                  : 'Impressora desconectada'
          }
        >
          <span className="text-[10px]">🖨️</span>
        </div>

        {/* Botão de atualizar impressora */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleCheckPrinter}
          disabled={checkingPrinter}
          title="Verificar impressoras manualmente"
        >
          <RefreshCw className={`h-4 w-4 ${checkingPrinter ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
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

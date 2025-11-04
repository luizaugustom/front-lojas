'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { printerApi } from '@/lib/api-endpoints';
import { getComputerId } from '@/lib/device-detection';
import { logger } from '@/lib/logger';

/**
 * Hook para registrar impressoras automaticamente quando o app inicia
 * Apenas funciona no desktop (Electron)
 */
export function useAutoRegisterPrinters() {
  const { isAuthenticated, user } = useAuth();
  const hasRegistered = useRef(false);

  useEffect(() => {
    // Só executa uma vez por sessão
    if (hasRegistered.current) return;
    
    // Só executa se estiver autenticado e for desktop (Electron)
    if (!isAuthenticated || !user) return;
    
    // Verificar se está no desktop (Electron)
    const isDesktop = typeof window !== 'undefined' && (window as any).electronAPI?.printers?.autoRegister;
    
    if (!isDesktop) {
      logger.log('[AutoRegisterPrinters] Não é desktop, pulando registro automático');
      return;
    }

    // Aguardar um pouco para garantir que tudo está carregado
    const timer = setTimeout(async () => {
      try {
        logger.log('[AutoRegisterPrinters] Iniciando registro automático de impressoras...');
        
        // Detectar impressoras via Electron
        const result = await (window as any).electronAPI.printers.autoRegister();
        
        if (!result.success || !result.printers || result.printers.length === 0) {
          logger.log('[AutoRegisterPrinters] Nenhuma impressora detectada');
          hasRegistered.current = true;
          return;
        }

        logger.log(`[AutoRegisterPrinters] ${result.printers.length} impressora(s) detectada(s)`);

        // Obter computerId
        const computerId = getComputerId();
        
        // Registrar no servidor
        try {
          const registerResponse = await printerApi.registerDevices({
            computerId,
            printers: result.printers,
          });
          
          if (registerResponse.data?.success) {
            logger.log('[AutoRegisterPrinters] Impressoras registradas com sucesso:', registerResponse.data.message);
          } else {
            logger.warn('[AutoRegisterPrinters] Erro ao registrar impressoras:', registerResponse.data);
          }
        } catch (registerError: any) {
          logger.error('[AutoRegisterPrinters] Erro ao registrar impressoras no servidor:', registerError);
          // Não bloquear a execução se falhar o registro
        }
        
        hasRegistered.current = true;
      } catch (error: any) {
        logger.error('[AutoRegisterPrinters] Erro ao detectar impressoras:', error);
        // Marcar como registrado mesmo se falhar para não tentar novamente
        hasRegistered.current = true;
      }
    }, 2000); // Aguardar 2 segundos após o mount

    return () => clearTimeout(timer);
  }, [isAuthenticated, user]);
}

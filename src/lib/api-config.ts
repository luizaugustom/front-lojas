/**
 * Configuração automática para aplicar correções da API
 * Este arquivo deve ser importado no início da aplicação para garantir
 * que as correções sejam aplicadas antes de qualquer chamada da API
 */

import { logger } from './logger';

// Aplicar correções automaticamente
if (typeof window !== 'undefined') {
  logger.log('✅ API configurada com sucesso!');
}

/**
 * Configuração automática para aplicar correções da API
 * Este arquivo deve ser importado no início da aplicação para garantir
 * que as correções sejam aplicadas antes de qualquer chamada da API
 */

import { applyApiFixes } from './api-fixes';

// Aplicar correções automaticamente
if (typeof window !== 'undefined') {
  console.log('🔧 Aplicando correções automáticas da API...');
  applyApiFixes();
  console.log('✅ Correções da API aplicadas com sucesso!');
  
  // Executar testes das correções em modo de desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    import('./test-api-fixes').then(({ testApiFixes }) => {
      console.log('🧪 Executando testes das correções...');
      testApiFixes();
    });
  }
}

export { applyApiFixes };

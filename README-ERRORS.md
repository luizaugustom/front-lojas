# Sistema de Tratamento de Erros

Este documento descreve o sistema de tratamento de erros implementado no frontend.

## Componentes do Sistema

### 1. Error Logger (`src/lib/error-logger.ts`)

Serviço centralizado para logging de erros em produção:

- **Logging Automático**: Captura erros com contexto completo (URL, user agent, timestamp, etc.)
- **Severidade**: Classifica erros como `low`, `medium`, `high` ou `critical`
- **Flush Automático**: Envia logs em lote a cada 5 segundos ou quando a página é fechada
- **Ambiente**: Mostra detalhes completos em desenvolvimento, apenas logs em produção

#### Configuração

Para enviar erros para um endpoint externo, configure:

```env
NEXT_PUBLIC_ERROR_API_ENDPOINT=https://seu-endpoint.com/api/errors
```

### 2. Error Boundary (`src/app/error.tsx`)

Captura erros de componentes React e renderiza uma UI amigável:

- Mostra detalhes completos em desenvolvimento
- Mostra mensagem amigável em produção com código de referência
- Botões para tentar novamente ou ir para início
- Loga erros automaticamente

### 3. Global Error Handler (`src/app/global-error.tsx`)

Captura erros críticos do Next.js que impedem o carregamento da aplicação:

- Erros que ocorrem no nível do layout ou root
- Interface minimalista para não depender de outros componentes
- Loga como erro crítico automaticamente

### 4. API Error Handler (`src/lib/handleApiError.ts`)

Tratamento robusto de erros de API:

- Extrai mensagens de erro de diferentes formatos (mensagem única, array, objeto por campo)
- Trata diferentes tipos de erro (rede, servidor, validação)
- Loga automaticamente para análise
- Mostra toast notifications (configurável)

#### Uso

```typescript
import { handleApiError } from '@/lib/handleApiError';

try {
  await api.get('/endpoint');
} catch (error) {
  const errorDetails = handleApiError(error, {
    endpoint: '/endpoint',
    method: 'GET',
    userId: currentUser?.id,
    showToast: true, // default: true
  });
  
  // errorDetails contém: message, status, code, endpoint, method, userId
}
```

### 5. React Query Error Handling

Configurado em `src/components/providers.tsx`:

- Retry inteligente (não tenta novamente em erros 4xx)
- Logging automático de erros de queries e mutations
- Máximo de 2 tentativas para erros de rede

## Fluxo de Tratamento de Erros

1. **Erro em Componente React** → `error.tsx` captura → Loga → Mostra UI amigável
2. **Erro Crítico do Next.js** → `global-error.tsx` captura → Loga como crítico → Mostra UI minimalista
3. **Erro de API** → `handleApiError` processa → Loga → Mostra toast → Retorna detalhes
4. **Erro de Query/Mutation** → React Query trata → Loga → Mostra toast (se configurado)

## Visualização de Erros

### Desenvolvimento

- Detalhes completos no console
- Stack traces visíveis
- Mensagens de erro detalhadas na UI

### Produção

- Logs enviados para endpoint configurado (se houver)
- Mensagens amigáveis para o usuário
- Código de referência (digest) para rastreamento
- Detalhes técnicos ocultos do usuário final

## Configuração para Vercel

O projeto está configurado para produção na Vercel:

- `vercel.json`: Configurações de build e headers de segurança
- `next.config.js`: Otimizações de produção, headers de segurança, compressão

### Variáveis de Ambiente Necessárias

```env
# API
NEXT_PUBLIC_API_BASE_URL=https://sua-api.com
NEXT_PUBLIC_API_URL=https://sua-api.com

# Error Logging (opcional)
NEXT_PUBLIC_ERROR_API_ENDPOINT=https://seu-endpoint.com/api/errors
```

## Melhores Práticas

1. **Sempre use `handleApiError`** para erros de API
2. **Use Error Boundaries** para isolar erros em componentes específicos
3. **Loge erros críticos** usando `errorLogger.logCriticalError`
4. **Teste o tratamento de erros** em diferentes cenários (rede, servidor, validação)
5. **Monitore os logs** em produção para identificar padrões de erro

## Rastreamento de Erros

Em produção, todos os erros são automaticamente logados com:

- Mensagem de erro
- Stack trace (se disponível)
- URL onde ocorreu
- AggregateAgent
- Timestamp
- ID do usuário (se disponível)
- Contexto adicional (endpoint, método, etc.)

Use o código de referência (digest) para rastrear erros específicos no sistema de logging.

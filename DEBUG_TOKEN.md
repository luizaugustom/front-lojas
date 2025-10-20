# 🔍 Debug - Token não está sendo enviado

## Problema

O login funciona, mas as requisições subsequentes (produtos, vendas, etc.) não estão enviando o token `Authorization: Bearer <token>`.

## Logs Adicionados

Adicionei logs de debug em `src/lib/apiClient.ts`:

1. **`setAccessToken`** - Mostra quando o token é setado
2. **Request Interceptor** - Mostra se o token está presente em cada requisição

## Como Testar

1. **Faça login** e observe o console:
   ```
   [setAccessToken] { hasToken: true, tokenPreview: 'eyJhbGciOiJIUzI1NiIs...' }
   ```

2. **Navegue para Produtos** e observe:
   ```
   [API Request Interceptor] {
     url: '/product',
     method: 'get',
     hasToken: true,  // ✅ Deve ser true
     token: 'eyJhbGciOiJIUzI1NiIs...'
   }
   ```

3. **Se `hasToken: false`**, o token não está sendo mantido em memória

## Possíveis Causas

### 1. Token perdido após navegação (SSR/CSR)
- Next.js pode estar re-renderizando o componente
- Token em memória é perdido entre páginas

### 2. AuthProvider não está envolvendo toda a aplicação
- Verificar `app/layout.tsx`

### 3. Múltiplas instâncias do apiClient
- Verificar se não há imports diferentes

## Solução Temporária (se necessário)

Se o problema persistir, podemos usar `sessionStorage` ao invés de memória:

```typescript
export function setAccessToken(token: string | null) {
  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem('access_token', token);
    } else {
      sessionStorage.removeItem('access_token');
    }
  }
  accessToken = token;
}

export function getAccessToken(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('access_token') || accessToken;
  }
  return accessToken;
}
```

## Próximos Passos

1. ✅ Logs adicionados
2. 🔄 Reiniciar servidor: `npm run dev`
3. 🔄 Fazer login
4. 🔄 Navegar para Produtos
5. 🔍 Verificar logs no Console (F12)
6. 📝 Reportar o que aparece nos logs

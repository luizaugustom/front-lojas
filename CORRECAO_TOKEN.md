# ✅ Correção - Token não estava sendo enviado

## 🔍 Problema Identificado

```
[API Request Interceptor] {
  url: '/customer',
  method: 'get',
  hasToken: false,  // ❌ Token perdido!
  token: null
}
```

O token estava sendo **perdido da memória** após navegação entre páginas no Next.js.

## 🎯 Causa

O Next.js faz **re-renderizações** e **code splitting**, o que pode causar:
- Perda de variáveis em memória
- Múltiplas instâncias do módulo
- Reset do estado entre navegações

## ✅ Solução Implementada

Adicionado **`sessionStorage` como backup** para persistir o token:

### Antes (só memória):
```typescript
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken; // ❌ Perdido após navegação
}
```

### Depois (memória + sessionStorage):
```typescript
export function setAccessToken(token: string | null) {
  accessToken = token;
  
  // ✅ Backup em sessionStorage
  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem('access_token', token);
    } else {
      sessionStorage.removeItem('access_token');
    }
  }
}

export function getAccessToken(): string | null {
  // Tenta memória primeiro
  if (accessToken) {
    return accessToken;
  }
  
  // ✅ Fallback para sessionStorage
  if (typeof window !== 'undefined') {
    const storedToken = sessionStorage.getItem('access_token');
    if (storedToken) {
      accessToken = storedToken; // Restaura na memória
      return storedToken;
    }
  }
  
  return null;
}
```

## 🔒 Segurança

### Por que sessionStorage e não localStorage?

- ✅ **sessionStorage**: Limpo ao fechar a aba (mais seguro)
- ❌ **localStorage**: Persiste indefinidamente (menos seguro)
- ✅ **httpOnly cookie**: Refresh token continua no cookie (mais seguro ainda)

### Fluxo de Segurança:

1. **Login** → `access_token` em sessionStorage + memória
2. **Refresh token** → httpOnly cookie (gerenciado pelo servidor)
3. **Logout** → Limpa sessionStorage + memória
4. **Fechar aba** → sessionStorage é limpo automaticamente

## 📊 Como Funciona Agora

### 1. Login
```
[setAccessToken] { hasToken: true, tokenPreview: 'eyJhbGci...' }
→ Salvo em: memória + sessionStorage
```

### 2. Navegação para Produtos
```
[getAccessToken] Token recuperado do sessionStorage
[API Request Interceptor] {
  url: '/product',
  hasToken: true,  // ✅ Token presente!
  token: 'eyJhbGci...'
}
```

### 3. Requisição enviada
```
GET /product
Headers: {
  Authorization: Bearer eyJhbGci...  // ✅ Token enviado!
}
```

## 🧪 Teste

1. **Faça login**
2. **Navegue para Produtos/Clientes/Vendas**
3. **Observe o console**:
   ```
   [getAccessToken] Token recuperado do sessionStorage
   [API Request Interceptor] { hasToken: true, ... }
   ```
4. **Verifique no Network (F12)**:
   - Request Headers deve ter: `Authorization: Bearer ...`

## ✅ Resultado Esperado

Agora todas as páginas devem funcionar corretamente:
- ✅ Produtos
- ✅ Vendas
- ✅ Clientes
- ✅ Contas a Pagar
- ✅ Dashboard
- ✅ Relatórios

## 🔄 Próximos Passos

1. **Reinicie o servidor** (se ainda não reiniciou):
   ```bash
   npm run dev
   ```

2. **Faça login novamente**

3. **Navegue pelas páginas** - deve funcionar!

4. **Verifique os logs** - deve aparecer:
   ```
   [getAccessToken] Token recuperado do sessionStorage
   [API Request Interceptor] { hasToken: true, ... }
   ```

## 📝 Observações

- O token **não** é salvo em localStorage (mais seguro)
- O token é limpo ao **fechar a aba**
- O refresh token continua em **httpOnly cookie** (gerenciado pelo backend)
- Interceptor tenta **refresh automático** em caso de 401

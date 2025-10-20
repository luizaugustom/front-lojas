# 🧪 Teste de Token - Passo a Passo

## Problema Atual

O token vem no login, mas não é repassado nas outras rotas.

## 🔍 Diagnóstico Detalhado

### 1. Limpar Cache do Navegador

**IMPORTANTE**: O navegador pode estar usando código antigo em cache.

1. **Abra o DevTools** (F12)
2. **Clique com botão direito** no ícone de refresh
3. **Selecione**: "Limpar cache e recarregar forçadamente"

OU

1. **DevTools** (F12) → **Application** → **Storage**
2. **Clique em**: "Clear site data"

### 2. Sequência de Logs Esperada

#### No Login:
```
[AuthContext.login] Iniciando login...
[authLogin] Tentando login: { login: '...', url: 'http://localhost:3000/auth/login' }
[authLogin] Sucesso: { access_token: '...', user: {...} }
[AuthContext.login] Login bem-sucedido, setando token: { hasToken: true, tokenPreview: '...' }
[setAccessToken] { hasToken: true, tokenPreview: '...' }
[AuthContext.login] Token setado no contexto
```

#### Ao Navegar para Produtos:
```
[getAccessToken] Token recuperado do sessionStorage
[API Request Interceptor] {
  url: '/product',
  method: 'get',
  hasToken: true,
  token: '...'
}
```

## 🧪 Teste Manual

### Passo 1: Verificar sessionStorage

Após fazer login, no Console do DevTools:

```javascript
// Verificar se o token está no sessionStorage
sessionStorage.getItem('access_token')
```

**Resultado esperado**: Deve retornar o token JWT (string longa começando com "eyJ...")

### Passo 2: Verificar se está sendo enviado

No DevTools → **Network**:

1. Navegue para Produtos
2. Clique na requisição `product`
3. Vá em **Headers**
4. Procure por: `Authorization: Bearer eyJ...`

**Resultado esperado**: Header deve estar presente

## 🔧 Soluções Alternativas

### Se o problema persistir, teste manualmente:

```javascript
// No Console do navegador, após login:

// 1. Verificar se o token existe
console.log('Token:', sessionStorage.getItem('access_token'));

// 2. Fazer uma requisição manual
fetch('http://localhost:3000/product', {
  headers: {
    'Authorization': 'Bearer ' + sessionStorage.getItem('access_token')
  },
  credentials: 'include'
})
.then(r => r.json())
.then(d => console.log('Produtos:', d))
.catch(e => console.error('Erro:', e));
```

## 🎯 Checklist de Verificação

- [ ] Servidor Next.js reiniciado (`npm run dev`)
- [ ] Cache do navegador limpo
- [ ] Logout feito (se estava logado antes)
- [ ] Login feito novamente
- [ ] Console aberto (F12) para ver logs
- [ ] Verificar logs no login
- [ ] Navegar para Produtos
- [ ] Verificar logs na navegação
- [ ] Verificar Network tab

## 📋 Informações para Debug

Por favor, copie e cole os logs que aparecem no console:

### 1. Logs do Login:
```
[Cole aqui os logs que aparecem ao fazer login]
```

### 2. Logs ao Navegar para Produtos:
```
[Cole aqui os logs que aparecem ao navegar]
```

### 3. sessionStorage:
```javascript
// Execute no console e cole o resultado:
sessionStorage.getItem('access_token')
```

### 4. Network Headers:
```
[Cole aqui os headers da requisição /product]
```

## 🚨 Se Nada Funcionar

Vou implementar uma solução mais robusta com:
- Verificação de inicialização
- Sincronização entre tabs
- Logs mais detalhados
- Fallback para localStorage (se necessário)

Mas primeiro, precisamos entender exatamente onde está falhando com os logs acima.

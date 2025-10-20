# 🔧 Como Configurar para Usar o Backend Real

## 📝 Passo a Passo

### 1. Edite o arquivo `.env.local`

Abra o arquivo `.env.local` na raiz do projeto e configure:

```env
# URL da sua API backend
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Desabilitar modo mock (opcional, já desabilita automaticamente quando API_URL está configurada)
NEXT_PUBLIC_USE_MOCK=false

# Configurações do app
NEXT_PUBLIC_APP_NAME=MontShop
NEXT_PUBLIC_VERSION=1.0.0
```

### 2. Substitua a URL da API

**Se sua API está rodando localmente:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Se sua API está em produção:**
```env
NEXT_PUBLIC_API_URL=https://sua-api.com/api
```

### 3. Reinicie o servidor

Após editar o `.env.local`, reinicie o servidor Next.js:

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

## ✅ Verificação

Após configurar, o sistema irá:

1. ✅ Fazer login usando a API real
2. ✅ Buscar produtos do backend
3. ✅ Buscar métricas do dashboard
4. ✅ Todas as operações CRUD usarão a API real

## 🔍 Como Saber se Está Funcionando

Abra o Console do navegador (F12) e você verá:

```
API login response: { access_token: "...", user: {...} }
```

Se aparecer "mock" no console, significa que ainda está usando dados mockados.

## ⚠️ Importante

- A API deve estar **rodando** antes de usar o frontend
- Certifique-se que a URL está **correta** (incluindo `/api` no final)
- Se houver erro de CORS, configure o backend para aceitar requisições do frontend

## 🎯 Endpoints Esperados

O frontend espera que sua API tenha os seguintes endpoints:

### Autenticação
- `POST /auth/login` - Login
- `GET /auth/me` - Dados do usuário

### Produtos
- `GET /product` - Listar produtos
- `POST /product` - Criar produto
- `GET /product/:id` - Buscar produto
- `PATCH /product/:id` - Atualizar produto
- `DELETE /product/:id` - Excluir produto
- `GET /product/barcode/:barcode` - Buscar por código de barras

### Vendas
- `GET /sale` - Listar vendas
- `POST /sale` - Criar venda
- `GET /sale/:id` - Buscar venda

### Clientes
- `GET /customer` - Listar clientes
- `POST /customer` - Criar cliente
- `GET /customer/:id` - Buscar cliente
- `PATCH /customer/:id` - Atualizar cliente
- `DELETE /customer/:id` - Excluir cliente

### Contas a Pagar
- `GET /bill-to-pay` - Listar contas
- `POST /bill-to-pay` - Criar conta
- `PATCH /bill-to-pay/:id/mark-paid` - Marcar como pago

### Fechamento de Caixa
- `POST /cash-closure` - Abrir caixa
- `GET /cash-closure/current` - Caixa atual
- `PATCH /cash-closure/close` - Fechar caixa

### Relatórios
- `POST /reports/generate` - Gerar relatório contábil

### Dashboard
- `GET /dashboard/metrics` - Métricas do dashboard

## 🚀 Pronto!

Após configurar, o sistema estará 100% integrado com seu backend!

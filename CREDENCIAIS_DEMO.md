# 🔐 Credenciais de Demonstração

Como a API backend não está configurada, o sistema está rodando em **modo demonstração** com dados mockados.

## 👤 Usuários Disponíveis

### Administrador
- **Login:** `admin@lojas.com`
- **Senha:** `admin123`
- **Permissões:** Acesso total ao sistema

### Empresa
- **Login:** `empresa@lojas.com`
- **Senha:** `empresa123`
- **Permissões:** Gerenciar produtos, vendas, clientes, relatórios

### Vendedor
- **Login:** `vendedor@lojas.com`
- **Senha:** `vendedor123`
- **Permissões:** Criar vendas, ver produtos

## 🎯 Como Usar

1. Acesse http://localhost:3001
2. Use uma das credenciais acima
3. Explore o sistema!

## ⚙️ Conectar à API Real

Para conectar à API backend real:

1. Edite o arquivo `.env.local`
2. Configure a URL da API:
   ```env
   NEXT_PUBLIC_API_URL=https://sua-api-url.com/api
   NEXT_PUBLIC_USE_MOCK=false
   ```
3. Reinicie o servidor: `npm run dev`

## 📊 Dados Demo Disponíveis

- ✅ Login funcional
- ✅ Dashboard com métricas
- ✅ 2 produtos de exemplo
- ✅ Gráficos de vendas
- ⚠️ Outras funcionalidades precisam da API real

# MontShop - Sistema de Gerenciamento de Lojas

Sistema completo de gerenciamento de lojas com funcionalidades de vendas, estoque, clientes e relatórios.

## 🚀 Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **React Query** - Gerenciamento de estado servidor
- **Zustand** - Gerenciamento de estado local
- **Axios** - Cliente HTTP
- **React Hook Form** - Formulários
- **Zod** - Validação

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn

## 🛠️ Instalação

```bash
npm install
```

## 🔧 Configuração

Copie o arquivo `.env.example` para `.env.local` e configure:

```env
NEXT_PUBLIC_API_BASE_URL=https://sua-api.com
NEXT_PUBLIC_API_URL=https://sua-api.com
NEXT_PUBLIC_USE_HTTPS=true
```

## 🏃 Executar

### Desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3001`

### Produção
```bash
npm run build
npm start
```

## 📦 Deploy

Consulte [DEPLOY.md](./DEPLOY.md) para instruções detalhadas de deploy.

### Deploy na Vercel (Recomendado)

1. Conecte seu repositório na Vercel
2. Configure as variáveis de ambiente
3. Faça deploy automático

Consulte [DEPLOY.md](./DEPLOY.md) para mais informações.

## 📚 Documentação

- [DEPLOY.md](./DEPLOY.md) - Guia de deploy
- [DEPLOY-CHANGES.md](./DEPLOY-CHANGES.md) - Alterações para produção
- [README-ERRORS.md](./README-ERRORS.md) - Sistema de tratamento de erros

## 🎯 Funcionalidades

- 📦 Gerenciamento de Produtos
- 👥 Cadastro de Clientes
- 💰 Sistema de Vendas
- 📊 Relatórios e Dashboard
- 🏢 Gerenciamento de Empresas
- 👤 Perfis de Usuário
- 📱 Interface Responsiva
- 🌓 Modo Escuro/Claro

## 🔒 Segurança

- Headers de segurança configurados
- Autenticação JWT
- Validação de dados
- HTTPS recomendado

## 📝 Licença

Este projeto é privado.


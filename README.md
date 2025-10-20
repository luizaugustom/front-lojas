# MontShop - Frontend

Sistema completo de gerenciamento de lojas desenvolvido em Next.js 14 com App Router.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **Zustand** - Gerenciamento de estado
- **React Hook Form** - Formulários
- **Zod** - Validação de dados
- **TanStack Query** - Gerenciamento de dados assíncronos
- **Recharts** - Gráficos
- **Axios** - Cliente HTTP

## 📋 Funcionalidades

### Autenticação
- Login para Admin, Empresa e Vendedor
- Proteção de rotas baseada em roles
- Gerenciamento de sessão com JWT

### Dashboard
- Métricas principais (vendas, produtos, clientes)
- Gráficos de vendas por período
- Produtos mais vendidos
- Alertas de estoque baixo
- Contas próximas do vencimento

### Produtos
- CRUD completo
- Upload de fotos
- Código de barras
- Controle de estoque
- Alertas de vencimento
- Categorias

### Sistema PDV (Ponto de Venda)
- Interface otimizada para vendas
- Carrinho de compras
- Múltiplas formas de pagamento
- Cálculo automático de troco
- Busca por código de barras

### Clientes
- CRUD completo
- Busca por CPF/CNPJ
- Endereços completos
- Histórico de compras

### Contas a Pagar
- Listagem com filtros
- Alertas de vencimento
- Marcar como pago
- Códigos de barras

### Fechamento de Caixa
- Abertura de caixa
- Relatório de vendas
- Fechamento com totalizadores

### Relatórios Contábeis
- Relatórios de vendas
- Relatórios de produtos
- Relatórios de notas fiscais
- Relatório completo
- Exportação em JSON, XML e Excel
- Filtros por período e vendedor
- Histórico de relatórios gerados

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd front-lojas
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.local.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_APP_NAME=MontShop
NEXT_PUBLIC_VERSION=1.0.0
```

4. Execute o projeto em desenvolvimento:
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 📦 Build para Produção

```bash
npm run build
npm start
```

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes E2E
npm run test:e2e
```

## 📱 PWA

O aplicativo é configurado como PWA (Progressive Web App) e pode ser instalado em dispositivos móveis.

## 🎨 Temas

O sistema suporta tema claro e escuro, com alternância automática baseada nas preferências do sistema.

## 👥 Tipos de Usuário e Permissões

### Admin
- Acesso total ao sistema
- Gerenciar empresas
- Ver todas as vendas
- Relatórios globais

### Empresa
- Gerenciar próprios dados
- Gerenciar vendedores
- Gerenciar produtos
- Ver vendas da empresa
- Relatórios da empresa
- Gerar relatórios contábeis

### Vendedor
- Criar vendas
- Ver próprias vendas
- Ver produtos
- Não pode gerenciar dados

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Páginas Next.js (App Router)
│   ├── (auth)/            # Rotas de autenticação
│   │   └── login/
│   ├── (dashboard)/       # Rotas protegidas
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── sales/
│   │   ├── customers/
│   │   ├── bills/
│   │   ├── cash-closure/
│   │   ├── reports/
│   │   └── settings/
│   └── layout.tsx
├── components/            # Componentes React
│   ├── ui/               # Componentes UI base
│   ├── layout/           # Componentes de layout
│   ├── products/         # Componentes de produtos
│   ├── sales/            # Componentes de vendas
│   ├── customers/        # Componentes de clientes
│   └── bills/            # Componentes de contas
├── lib/                  # Utilitários
│   ├── api.ts           # Cliente API
│   ├── auth.ts          # Autenticação
│   ├── utils.ts         # Funções utilitárias
│   └── validations.ts   # Schemas Zod
├── store/               # Estado global (Zustand)
│   ├── auth-store.ts
│   ├── cart-store.ts
│   └── ui-store.ts
└── types/               # Tipos TypeScript
    └── index.ts
```

## 🔌 API Endpoints

O frontend consome os seguintes endpoints da API:

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

## 🎯 Próximos Passos

- [ ] Implementar testes unitários
- [ ] Adicionar testes E2E
- [ ] Implementar notificações em tempo real
- [ ] Adicionar suporte a múltiplos idiomas
- [ ] Implementar impressão de cupons
- [ ] Adicionar integração com WhatsApp
- [ ] Implementar PWA offline

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Desenvolvimento

Desenvolvido com ❤️ usando Next.js 14 e TypeScript.

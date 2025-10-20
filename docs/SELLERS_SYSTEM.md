# Sistema de Gerenciamento de Vendedores

Este documento descreve a implementação completa do sistema de gerenciamento de vendedores para o PDV (Ponto de Venda).

## 🚀 Funcionalidades Implementadas

### 1. Página Principal de Vendedores (`/vendedores`)
- **Lista completa de vendedores** com informações detalhadas
- **Estatísticas gerais** em cards informativos:
  - Total de vendedores
  - Total de vendas
  - Faturamento total
  - Média por vendedor
- **Busca e filtros** por nome, email ou CPF
- **Ações disponíveis**:
  - 👁️ Visualizar detalhes
  - ✏️ Editar vendedor
  - 🗑️ Excluir vendedor
  - ➕ Adicionar novo vendedor

### 2. Modal de Criação/Edição de Vendedor
- **Campos obrigatórios**:
  - Login (email) - com validação de email
  - Senha - mínimo 6 caracteres (apenas na criação)
  - Nome completo - mínimo 2 caracteres
- **Campos opcionais**:
  - CPF - com máscara XXX.XXX.XXX-XX e validação
  - Data de nascimento - date picker
  - Email - com validação de email
  - Telefone - com máscara (XX) XXXXX-XXXX
- **Validação em tempo real** com feedback visual
- **Loading states** durante requisições
- **Máscaras automáticas** para CPF e telefone

### 3. Modal de Detalhes do Vendedor
- **Informações pessoais completas**
- **Estatísticas detalhadas**:
  - Total de vendas
  - Faturamento total
  - Ticket médio
- **Gráficos interativos**:
  - Vendas por período (gráfico de barras)
  - Produtos mais vendidos (gráfico de pizza)
  - Evolução do faturamento (gráfico de linha)
- **Lista de vendas recentes** com paginação
- **Botões de ação**: Editar e Fechar

### 4. Página de Perfil do Vendedor (`/vendedor/perfil`)
- **Formulário de edição** do próprio perfil
- **Campos editáveis**: Nome, CPF, Data nascimento, Email, Telefone
- **Campo não editável**: Login (email)
- **Estatísticas pessoais** em cards
- **Gráficos de performance** pessoal
- **Histórico de vendas** com filtros por período

### 5. Validações e Segurança
- **Validação com Zod** para todos os formulários
- **Máscaras automáticas** para CPF e telefone
- **Feedback visual** para erros de validação
- **Confirmação de exclusão** com nome do vendedor
- **Loading states** em todas as operações

## 🛠️ Tecnologias Utilizadas

- **Next.js 14+** com App Router
- **TypeScript** com tipagem completa
- **Tailwind CSS** para estilização
- **React Hook Form** para formulários
- **Zod** para validação
- **Axios** para requisições HTTP
- **React Query** para cache e estado
- **Lucide React** para ícones
- **Recharts** para gráficos
- **Radix UI** para componentes acessíveis

## 📁 Estrutura de Arquivos

```
src/
├── components/sellers/
│   ├── seller-dialog.tsx           # Modal de criação/edição
│   ├── seller-details-dialog.tsx    # Modal de detalhes
│   ├── sellers-table.tsx            # Tabela de vendedores
│   └── seller-charts.tsx            # Componente de gráficos
├── app/(dashboard)/
│   ├── sellers/page.tsx             # Página principal
│   └── seller/profile/page.tsx      # Página de perfil
├── types/index.ts                   # Tipos TypeScript
├── lib/
│   ├── api.ts                       # Funções da API
│   └── validations.ts               # Schemas de validação
```

## 🔌 Endpoints da API Utilizados

### Endpoints Principais
- `GET /seller` - Listar vendedores
- `POST /seller` - Criar vendedor
- `GET /seller/{id}` - Buscar vendedor por ID
- `PATCH /seller/{id}` - Atualizar vendedor
- `DELETE /seller/{id}` - Deletar vendedor

### Endpoints de Estatísticas
- `GET /seller/{id}/stats` - Estatísticas do vendedor
- `GET /seller/{id}/sales` - Vendas do vendedor

### Endpoints de Perfil (vendedor logado)
- `GET /seller/my-profile` - Meu perfil
- `PATCH /seller/my-profile` - Atualizar meu perfil
- `GET /seller/my-stats` - Minhas estatísticas
- `GET /seller/my-sales` - Minhas vendas

## 🎨 Design e UX

### Cores e Temas
- **Azul**: Ações principais e elementos de destaque
- **Verde**: Sucesso e estatísticas positivas
- **Vermelho**: Ações de exclusão e alertas
- **Cinza**: Textos secundários e elementos neutros

### Componentes Visuais
- **Cards informativos** com ícones coloridos
- **Badges** para estatísticas rápidas
- **Gráficos interativos** com cores consistentes
- **Loading states** com spinners animados
- **Feedback visual** para validações

### Responsividade
- **Mobile-first** design
- **Grid responsivo** para diferentes tamanhos de tela
- **Modais adaptáveis** para mobile e desktop
- **Tabelas responsivas** com scroll horizontal

## 🔒 Segurança e Validação

### Validações do Frontend
- **Email**: Formato válido obrigatório
- **Senha**: Mínimo 6 caracteres
- **Nome**: Mínimo 2 caracteres
- **CPF**: Formato XXX.XXX.XXX-XX
- **Telefone**: Formato (XX) XXXXX-XXXX

### Autenticação
- **Bearer Token** em todas as requisições
- **Refresh automático** de token
- **Logout automático** em caso de token inválido

## 📊 Gráficos e Estatísticas

### Tipos de Gráficos
1. **Gráfico de Barras**: Vendas por período
2. **Gráfico de Pizza**: Produtos mais vendidos
3. **Gráfico de Linha**: Evolução do faturamento

### Dados Exibidos
- **Vendas por período** (últimos 30 dias)
- **Produtos mais vendidos** com quantidades
- **Faturamento total** e por período
- **Ticket médio** de vendas

## 🚀 Como Usar

### Para Administradores/Empresas
1. Acesse `/vendedores` para gerenciar vendedores
2. Clique em "Novo Vendedor" para criar um vendedor
3. Use os botões de ação na tabela para editar/visualizar/excluir
4. Visualize estatísticas gerais nos cards superiores

### Para Vendedores
1. Acesse `/vendedor/perfil` para editar seu perfil
2. Visualize suas estatísticas pessoais
3. Acompanhe seu histórico de vendas
4. Monitore sua performance através dos gráficos

## 🔧 Configuração

### Variáveis de Ambiente
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Dependências Principais
```json
{
  "@hookform/resolvers": "^3.3.2",
  "@tanstack/react-query": "^5.8.4",
  "react-hook-form": "^7.48.2",
  "recharts": "^2.10.3",
  "zod": "^3.22.4"
}
```

## 📝 Próximos Passos

### Melhorias Futuras
- [ ] Exportação de relatórios em PDF/Excel
- [ ] Notificações em tempo real
- [ ] Dashboard de performance avançado
- [ ] Integração com sistema de comissões
- [ ] Relatórios personalizáveis

### Otimizações
- [ ] Cache inteligente para estatísticas
- [ ] Paginação virtual para grandes listas
- [ ] Compressão de imagens
- [ ] Lazy loading de componentes

## 🐛 Troubleshooting

### Problemas Comuns
1. **Erro 401**: Token expirado - faça login novamente
2. **Erro 403**: Sem permissão - verifique seu perfil de usuário
3. **Erro 500**: Problema no servidor - tente novamente

### Logs e Debug
- Use o console do navegador para logs detalhados
- Verifique a aba Network para requisições HTTP
- Monitore o estado do React Query no DevTools

---

**Desenvolvido com ❤️ para o sistema PDV**



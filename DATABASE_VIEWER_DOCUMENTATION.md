# Visualizador de Dados do Banco de Dados

## Visão Geral

O **Visualizador de Dados do Banco** é uma ferramenta de debug e monitoramento que permite visualizar em tempo real os dados que estão sendo recebidos do banco de dados através da API.

## Como Acessar

1. **Via Sidebar**: Navegue até "Dados do Banco" no menu lateral
2. **URL Direta**: `/database-viewer`
3. **Disponível para**: Todos os usuários (admin, empresa, vendedor)

## Funcionalidades

### 1. Status da Conexão
- **Monitoramento em Tempo Real**: Verifica a conectividade com o banco de dados
- **Tempo de Resposta**: Mostra a latência das requisições
- **Status Visual**: Indicadores visuais de conectividade (verde = conectado, vermelho = erro)
- **Verificação Manual**: Botão para testar a conexão manualmente

### 2. Visualização de Dados
- **Produtos**: Lista todos os produtos do banco de dados
- **Estatísticas**: Informações agregadas (total de produtos, valor total, etc.)
- **Categorias**: Lista de categorias disponíveis
- **Produtos com Estoque Baixo**: Produtos que precisam de reposição

### 3. Dados Brutos
- **Modo Debug**: Toggle para mostrar/ocultar dados brutos da API
- **JSON Completo**: Resposta completa de todos os endpoints
- **Logs Detalhados**: Informações de debug no console do navegador

## Endpoints Monitorados

### Produtos
- `GET /product` - Lista de produtos
- `GET /product/stats` - Estatísticas dos produtos
- `GET /product/low-stock` - Produtos com estoque baixo
- `GET /product/categories` - Categorias disponíveis

### Estrutura dos Dados

#### Resposta de Produtos
```json
{
  "products": [
    {
      "id": "string",
      "name": "string",
      "barcode": "string",
      "price": "number",
      "stockQuantity": "number",
      "category": "string",
      "photos": ["string"],
      "expirationDate": "string",
      "companyId": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

#### Resposta de Estatísticas
```json
{
  "stats": {
    "totalProducts": "number",
    "totalValue": "number",
    "lowStockCount": "number",
    "expiringCount": "number"
  }
}
```

## Casos de Uso

### 1. Debug de Problemas
- **Dados não aparecem**: Verificar se a API está retornando dados
- **Erro de conexão**: Identificar problemas de conectividade
- **Dados incorretos**: Comparar dados brutos com o esperado

### 2. Monitoramento
- **Performance**: Verificar tempo de resposta da API
- **Disponibilidade**: Monitorar status da conexão
- **Integridade**: Verificar se os dados estão completos

### 3. Desenvolvimento
- **Testes de API**: Verificar se endpoints estão funcionando
- **Validação de Dados**: Confirmar estrutura dos dados
- **Debug de Integração**: Identificar problemas entre frontend e backend

## Logs de Debug

O visualizador gera logs detalhados no console do navegador:

```javascript
[DatabaseDataViewer] Fazendo requisição para /product
[DatabaseDataViewer] Resposta recebida: {data: {...}}
[DatabaseDataViewer] Dados da resposta: {...}
[DatabaseConnectionStatus] Testando conexão com o banco...
[DatabaseConnectionStatus] Conexão bem-sucedida: {responseTime: 150, lastCheck: ...}
```

## Solução de Problemas

### Problema: "Nenhum produto encontrado"
**Possíveis Causas:**
- Banco de dados vazio
- Problema de permissão
- Erro na API

**Soluções:**
1. Verificar logs no console
2. Testar conexão manualmente
3. Verificar dados brutos da API

### Problema: "Erro na Conexão"
**Possíveis Causas:**
- Backend offline
- Problema de rede
- Erro de autenticação

**Soluções:**
1. Verificar se o backend está rodando
2. Verificar conexão de rede
3. Verificar token de autenticação

### Problema: "Dados incompletos"
**Possíveis Causas:**
- Problema no interceptor do axios
- Erro na serialização
- Problema no backend

**Soluções:**
1. Verificar dados brutos
2. Verificar logs do interceptor
3. Verificar logs do backend

## Configuração

### Variáveis de Ambiente
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Permissões
- **Admin**: Acesso completo a todos os dados
- **Empresa**: Acesso aos dados da própria empresa
- **Vendedor**: Acesso limitado aos dados necessários

## Manutenção

### Atualizações Automáticas
- Os dados são atualizados automaticamente quando a página é focada
- Botão manual de atualização disponível
- Cache inteligente para evitar requisições desnecessárias

### Limpeza de Logs
- Logs são mantidos apenas durante a sessão
- Não há persistência de logs no localStorage
- Console do navegador pode ser limpo manualmente

## Segurança

### Dados Sensíveis
- IDs de produtos são truncados na exibição
- Dados brutos são mostrados apenas quando solicitado
- Logs não contêm informações sensíveis

### Acesso
- Requer autenticação válida
- Respeita permissões de usuário
- Não expõe dados de outras empresas

## Status

✅ **Implementado e Funcional**

O visualizador está totalmente implementado e pode ser usado para debug e monitoramento dos dados do banco de dados.

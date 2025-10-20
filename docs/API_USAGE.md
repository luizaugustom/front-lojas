# Guia de Uso da API

Este documento explica como usar os endpoints da API no frontend.

## Configuração

### 1. Arquivo `.env.local`

Crie o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=MontShop
NEXT_PUBLIC_VERSION=1.0.0
```

**Importante**: A URL da API **NÃO** deve conter `/api` no final, pois os endpoints já incluem o caminho completo.

### 2. Importar os Endpoints

```typescript
import { productApi, saleApi, customerApi } from '@/lib/api-endpoints';
```

## Exemplos de Uso

### Autenticação

```typescript
import { authApi } from '@/lib/api-endpoints';

// Login
const { data } = await authApi.login('usuario', 'senha');
// Retorna: { access_token, user }
// Cookie httpOnly refresh_token é setado automaticamente

// Refresh token
const { data } = await authApi.refresh();
// Retorna: { access_token, user }

// Logout
await authApi.logout();
```

### Produtos

```typescript
import { productApi } from '@/lib/api-endpoints';

// Listar produtos (paginado)
const { data } = await productApi.list({ page: 1, limit: 10, search: 'termo' });

// Buscar por código de barras
const { data } = await productApi.byBarcode('7891234567890');

// Criar produto
const { data } = await productApi.create({
  name: 'Produto Teste',
  price: 10.50,
  stock: 100,
  // ... outros campos
});

// Atualizar produto
const { data } = await productApi.update('uuid-do-produto', {
  price: 12.00,
});

// Atualizar estoque
const { data } = await productApi.updateStock('uuid-do-produto', {
  quantity: 50,
  operation: 'add', // ou 'subtract'
});

// Estatísticas
const { data } = await productApi.stats();

// Produtos com estoque baixo
const { data } = await productApi.lowStock(10); // threshold

// Produtos próximos do vencimento
const { data } = await productApi.expiring(30); // dias

// Categorias
const { data } = await productApi.categories();

// Deletar produto
await productApi.delete('uuid-do-produto');
```

### Vendas

```typescript
import { saleApi } from '@/lib/api-endpoints';

// Criar venda
const { data } = await saleApi.create({
  customerId: 'uuid-do-cliente',
  items: [
    { productId: 'uuid-produto-1', quantity: 2, price: 10.00 },
    { productId: 'uuid-produto-2', quantity: 1, price: 25.00 },
  ],
  paymentMethod: 'credit_card',
  // ... outros campos
});

// Listar vendas
const { data } = await saleApi.list({
  page: 1,
  limit: 10,
  sellerId: 'uuid-vendedor',
  startDate: '2025-01-01',
  endDate: '2025-01-31',
});

// Buscar venda específica
const { data } = await saleApi.get('uuid-da-venda');

// Estatísticas de vendas
const { data } = await saleApi.stats();

// Minhas vendas (vendedor)
const { data } = await saleApi.mySales();

// Minhas estatísticas (vendedor)
const { data } = await saleApi.myStats();

// Processar troca
const { data } = await saleApi.exchange({
  originalSaleId: 'uuid-venda-original',
  items: [/* itens da troca */],
});

// Reimprimir cupom
await saleApi.reprint('uuid-da-venda');
```

### Clientes

```typescript
import { customerApi } from '@/lib/api-endpoints';

// Criar cliente
const { data } = await customerApi.create({
  name: 'João Silva',
  cpfCnpj: '12345678900',
  email: 'joao@example.com',
  phone: '11999999999',
  // ... outros campos
});

// Listar clientes
const { data } = await customerApi.list({
  page: 1,
  limit: 10,
  search: 'João',
});

// Buscar por CPF/CNPJ
const { data } = await customerApi.byCpfCnpj('12345678900');

// Buscar cliente
const { data } = await customerApi.get('uuid-do-cliente');

// Parcelas do cliente
const { data } = await customerApi.installments('uuid-do-cliente');

// Estatísticas
const { data } = await customerApi.stats();

// Atualizar cliente
const { data } = await customerApi.update('uuid-do-cliente', {
  phone: '11988888888',
});

// Deletar cliente
await customerApi.delete('uuid-do-cliente');
```

### Contas a Pagar

```typescript
import { billToPayApi } from '@/lib/api-endpoints';

// Criar conta
const { data } = await billToPayApi.create({
  description: 'Aluguel',
  amount: 1500.00,
  dueDate: '2025-02-01',
  // ... outros campos
});

// Listar contas
const { data } = await billToPayApi.list({
  page: 1,
  limit: 10,
  isPaid: false,
  startDate: '2025-01-01',
  endDate: '2025-01-31',
});

// Contas vencidas
const { data } = await billToPayApi.overdue();

// Contas próximas do vencimento
const { data } = await billToPayApi.upcoming(7); // próximos 7 dias

// Marcar como paga
await billToPayApi.markPaid('uuid-da-conta');

// Estatísticas
const { data } = await billToPayApi.stats();
```

### Fechamento de Caixa

```typescript
import { cashClosureApi } from '@/lib/api-endpoints';

// Abrir caixa
const { data } = await cashClosureApi.create({
  initialAmount: 100.00,
  sellerId: 'uuid-vendedor',
});

// Caixa atual
const { data } = await cashClosureApi.current();

// Fechar caixa
const { data } = await cashClosureApi.close({
  finalAmount: 1500.00,
  notes: 'Fechamento normal',
});

// Histórico
const { data } = await cashClosureApi.history({ page: 1, limit: 10 });

// Estatísticas
const { data } = await cashClosureApi.stats();

// Reimprimir relatório
await cashClosureApi.reprint('uuid-do-fechamento');
```

### Upload de Arquivos

```typescript
import { uploadApi } from '@/lib/api-endpoints';

// Upload único
const file = event.target.files[0];
const { data } = await uploadApi.single(file);
// Retorna: { url: 'https://...' }

// Upload múltiplo
const files = Array.from(event.target.files);
const { data } = await uploadApi.multiple(files);
// Retorna: { urls: ['https://...', 'https://...'] }

// Redimensionar imagem
const { data } = await uploadApi.resize(file, 800, 600);

// Otimizar imagem
const { data } = await uploadApi.optimize(file);

// Deletar arquivo
await uploadApi.deleteFile('https://...');

// Deletar múltiplos arquivos
await uploadApi.deleteFiles(['https://...', 'https://...']);
```

### Relatórios

```typescript
import { reportsApi } from '@/lib/api-endpoints';

// Gerar relatório
const response = await reportsApi.generate({
  format: 'xlsx', // ou 'json', 'xml'
  types: ['sales', 'products'],
  startDate: '2025-01-01',
  endDate: '2025-01-31',
});

// Baixar o arquivo
const blob = response.data;
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'relatorio.xlsx';
a.click();
```

### Fiscal (NFe/NFSe)

```typescript
import { fiscalApi } from '@/lib/api-endpoints';

// Gerar NFe
const { data } = await fiscalApi.generateNFe({
  saleId: 'uuid-da-venda',
  // ... dados da nota
});

// Gerar NFSe
const { data } = await fiscalApi.generateNFSe({
  saleId: 'uuid-da-venda',
  // ... dados da nota
});

// Listar documentos fiscais
const { data } = await fiscalApi.list({
  page: 1,
  limit: 10,
  documentType: 'nfe',
});

// Buscar por chave de acesso
const { data } = await fiscalApi.byAccessKey('35250112345678901234550010000000011234567890');

// Download do documento
const response = await fiscalApi.download('uuid-documento', 'pdf');
const blob = response.data;
// ... baixar arquivo

// Cancelar documento
await fiscalApi.cancel('uuid-documento', {
  reason: 'Erro na emissão',
});

// Validar empresa
const { data } = await fiscalApi.validateCompany();

// Estatísticas
const { data } = await fiscalApi.stats();
```

### WhatsApp

```typescript
import { whatsappApi } from '@/lib/api-endpoints';

// Enviar mensagem
await whatsappApi.sendMessage({
  to: '5511999999999',
  message: 'Olá, sua venda foi confirmada!',
});

// Enviar template
await whatsappApi.sendTemplate({
  to: '5511999999999',
  templateName: 'sale_confirmation',
  params: ['João', '123.45'],
});

// Validar telefone
const { data } = await whatsappApi.validatePhone('11999999999');

// Formatar telefone
const { data } = await whatsappApi.formatPhone('11999999999');
```

## Tratamento de Erros

```typescript
import { AxiosError } from 'axios';

try {
  const { data } = await productApi.list();
} catch (error) {
  if (error instanceof AxiosError) {
    // Erro da API
    console.error('Erro:', error.response?.data?.message);
    console.error('Status:', error.response?.status);
  } else {
    // Erro desconhecido
    console.error('Erro desconhecido:', error);
  }
}
```

## Autenticação Automática

O `apiClient` já adiciona automaticamente o header `Authorization: Bearer <token>` em todas as requisições protegidas. O token é gerenciado pelo `AuthContext`.

## Refresh Token Automático

O refresh token é gerenciado automaticamente via cookie httpOnly. Quando o access_token expira, o interceptor tenta renovar automaticamente chamando `/auth/refresh`.

## Paginação Padrão

A maioria dos endpoints de listagem aceita:
- `page`: número da página (default: 1)
- `limit`: itens por página (default: 10)

## Observações Importantes

1. **Roles**: Verifique as permissões necessárias para cada endpoint
2. **Cookies**: Use `withCredentials: true` para enviar cookies (já configurado no apiClient)
3. **Upload**: Use `multipart/form-data` para upload de arquivos
4. **Download**: Use `responseType: 'blob'` para download de arquivos
5. **URL Base**: Não adicione `/api` no final da URL base, os endpoints já incluem o caminho completo

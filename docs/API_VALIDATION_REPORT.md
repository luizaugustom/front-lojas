# Relatório de Validação - Frontend vs API

## ✅ Configuração Geral

### Correto
- ✅ **Base URL**: `http://localhost:3000` (sem `/api`)
- ✅ **withCredentials**: `true` (envia cookies httpOnly)
- ✅ **Authorization Header**: `Bearer <token>` adicionado automaticamente
- ✅ **Refresh Token**: Gerenciado via cookie httpOnly
- ✅ **Interceptors**: Implementados para refresh automático

---

## 🔍 Análise por Endpoint

### 1. Autenticação (POST /auth/login)

#### ✅ CORRETO
**API Espera:**
```json
{
  "login": "empresa@example.com",
  "password": "company123"
}
```

**Frontend Envia:**
```typescript
await authLogin(login, password);
// Implementação em apiClient.ts linha 157
```

**Status**: ✅ Compatível

---

### 2. Vendas (POST /sale)

#### ⚠️ PROBLEMA ENCONTRADO

**API Espera (FRONTEND_ROUTES.md linha 181-192):**
```json
{
  "items": [
    { "productId": "...", "quantity": 2, "unitPrice": 1299.99 }
  ],
  "paymentMethod": ["pix"],
  "clientCpfCnpj": "987.654.321-00",
  "clientName": "Maria Santos",
  "isInstallment": false,
  "change": 0
}
```

**Frontend Envia (checkout-dialog.tsx linha 61-70):**
```typescript
{
  items: items.map((item) => ({
    productId: item.product.id,
    quantity: item.quantity,
    // ❌ FALTANDO: unitPrice
  })),
  paymentMethods: [selectedPayment], // ✅ Correto (array)
  clientName: data.clientName, // ✅ Correto
  totalPaid: selectedPayment === 'cash' ? totalPaid : total,
  discount: discount > 0 ? discount : undefined,
  // ❌ FALTANDO: clientCpfCnpj
  // ❌ FALTANDO: isInstallment
  // ❌ FALTANDO: change
}
```

**Problemas:**
1. ❌ **unitPrice** não está sendo enviado nos items
2. ❌ **clientCpfCnpj** não está sendo enviado
3. ❌ **isInstallment** não está sendo enviado
4. ❌ **change** não está sendo enviado
5. ⚠️ **paymentMethod** vs **paymentMethods** - API usa singular, frontend usa plural

**Impacto**: A API pode rejeitar a requisição ou calcular valores incorretamente.

---

### 3. Produtos (POST /product)

#### ✅ VERIFICAR

**API Espera (FRONTEND_ROUTES.md linha 99-111):**
```json
{
  "name": "Camiseta Polo",
  "photos": ["https://.../polo.jpg"],
  "barcode": "7891234567899",
  "size": "M",
  "stockQuantity": 75,
  "price": 89.99,
  "category": "Roupas",
  "expirationDate": "2025-12-31"
}
```

**Frontend Type (types/index.ts linha 178-192):**
```typescript
export interface CreateProductDto {
  name: string;
  barcode?: string;
  photos?: string[];
  size?: string;
  stockQuantity: number;
  price: number;
  category?: string;
  description?: string;
  expirationDate?: string;
}
```

**Status**: ✅ Compatível (todos os campos necessários estão presentes)

---

### 4. Clientes (POST /customer)

#### ✅ VERIFICAR

**API Espera (FRONTEND_ROUTES.md linha 213-223):**
```json
{
  "name": "Cliente X",
  "phone": "(11) 77777-7777",
  "cpfCnpj": "987.654.321-00",
  "zipCode": "04567-890",
  "city": "São Paulo"
}
```

**Frontend Type (types/index.ts linha 205-211):**
```typescript
export interface CreateCustomerDto {
  name: string;
  email?: string;
  phone?: string;
  cpfCnpj?: string;
  address?: CustomerAddress;
}
```

**Status**: ⚠️ Estrutura diferente
- API usa campos planos: `zipCode`, `city`
- Frontend usa objeto: `address: { zipCode, city, ... }`

---

### 5. Contas a Pagar (POST /bill-to-pay)

#### ✅ VERIFICAR

**API Espera (FRONTEND_ROUTES.md linha 233-242):**
```json
{
  "title": "Conta de luz - Novembro 2025",
  "barcode": "12345678901234567890",
  "paymentInfo": "Banco XYZ",
  "dueDate": "2025-11-15",
  "amount": 150.75
}
```

**Frontend Type (types/index.ts linha 213-218):**
```typescript
export interface CreateBillDto {
  description: string; // ❌ API usa "title"
  amount: number;
  dueDate: string;
  barcode?: string;
  // ❌ FALTANDO: paymentInfo
}
```

**Problemas:**
1. ❌ Campo `description` deveria ser `title`
2. ❌ Campo `paymentInfo` não está presente

---

### 6. Fechamento de Caixa (POST /cash-closure)

#### ✅ VERIFICAR

**API Espera (FRONTEND_ROUTES.md linha 258-261):**
```json
{ "openingAmount": 100.00 }
```

**Status**: ✅ Simples, provavelmente compatível

---

### 7. Relatórios (POST /reports/generate)

#### ✅ VERIFICAR

**API Espera (FRONTEND_ROUTES.md linha 290-296):**
```json
{
  "reportType": "sales",
  "format": "excel"
}
```

**Status**: ✅ Compatível com api-endpoints.ts

---

## 📋 Resumo de Problemas Críticos

### 🔴 Crítico - Precisa Correção Imediata

1. **POST /sale** - Items sem `unitPrice`
   - Localização: `src/components/sales/checkout-dialog.tsx` linha 62-65
   - Correção: Adicionar `unitPrice: item.product.price`

2. **POST /sale** - Campos faltando
   - `clientCpfCnpj`
   - `isInstallment`
   - `change`

3. **POST /bill-to-pay** - Campo errado
   - Usar `title` ao invés de `description`
   - Adicionar `paymentInfo`

### 🟡 Atenção - Verificar Comportamento

4. **POST /customer** - Estrutura de endereço
   - API pode esperar campos planos ao invés de objeto `address`

5. **paymentMethod vs paymentMethods**
   - API usa singular, frontend usa plural
   - Verificar qual a API realmente aceita

---

## 🔧 Ações Recomendadas

### Prioridade Alta

1. **Corrigir CreateSaleDto**
   ```typescript
   export interface CreateSaleDto {
     items: {
       productId: string;
       quantity: number;
       unitPrice: number; // ✅ ADICIONAR
     }[];
     paymentMethod: string[]; // ⚠️ Verificar singular vs plural
     clientName?: string;
     clientCpfCnpj?: string; // ✅ ADICIONAR
     isInstallment?: boolean; // ✅ ADICIONAR
     change?: number; // ✅ ADICIONAR
     customerId?: string;
     totalPaid?: number;
     discount?: number;
   }
   ```

2. **Corrigir checkout-dialog.tsx**
   ```typescript
   const saleData: CreateSaleDto = {
     items: items.map((item) => ({
       productId: item.product.id,
       quantity: item.quantity,
       unitPrice: item.product.price, // ✅ ADICIONAR
     })),
     paymentMethod: [selectedPayment], // ou paymentMethods
     clientName: data.clientName,
     clientCpfCnpj: data.clientCpfCnpj, // ✅ ADICIONAR ao form
     isInstallment: selectedPayment === 'installment', // ✅ ADICIONAR
     change: selectedPayment === 'cash' ? change : 0, // ✅ ADICIONAR
     totalPaid: selectedPayment === 'cash' ? totalPaid : total,
     discount: discount > 0 ? discount : undefined,
   };
   ```

3. **Corrigir CreateBillDto**
   ```typescript
   export interface CreateBillDto {
     title: string; // ✅ RENOMEAR de description
     amount: number;
     dueDate: string;
     barcode?: string;
     paymentInfo?: string; // ✅ ADICIONAR
   }
   ```

### Prioridade Média

4. **Adicionar campo CPF/CNPJ no formulário de venda**
5. **Verificar estrutura de endereço em Customer**
6. **Testar todos os endpoints com dados reais**

---

## ✅ Checklist de Validação

- [ ] Corrigir `CreateSaleDto` com todos os campos
- [ ] Atualizar `checkout-dialog.tsx` para enviar dados completos
- [ ] Adicionar campo CPF/CNPJ no formulário de checkout
- [ ] Corrigir `CreateBillDto` (title e paymentInfo)
- [ ] Testar POST /sale com dados reais
- [ ] Testar POST /bill-to-pay com dados reais
- [ ] Verificar estrutura de Customer
- [ ] Validar todos os tipos com a documentação da API

---

## 📚 Referências

- **Documentação da API**: `FRONTEND_ROUTES.md`
- **Types do Frontend**: `src/types/index.ts`
- **API Client**: `src/lib/apiClient.ts`
- **API Endpoints**: `src/lib/api-endpoints.ts`
- **Componente de Venda**: `src/components/sales/checkout-dialog.tsx`

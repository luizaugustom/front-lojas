import * as z from 'zod';

// Helper para converter null em string vazia para campos opcionais
const optionalString = () => z.string().nullable().transform(val => val ?? '');
// Helper para campos opcionais que devem ser undefined quando vazios (não enviar)
const optionalStringOrUndefined = () => z.string().nullable().optional().transform(val => val === null || val === '' ? undefined : val);

// Auth Schemas
export const loginSchema = z.object({
  login: z.string().min(1, 'Login não pode ser vazio'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

// Product Schemas
export const productSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(255),
  barcode: z.string().min(8, 'Código de barras inválido').max(20),
  price: z.number().positive('Preço deve ser positivo'),
  costPrice: z.number().positive('Preço de custo deve ser positivo').optional(),
  stockQuantity: z.number().min(0, 'Quantidade não pode ser negativa'),
  minStockQuantity: z.number().min(0, 'Quantidade mínima não pode ser negativa').optional(),
  category: optionalStringOrUndefined(),
  description: optionalStringOrUndefined(),
  expirationDate: optionalStringOrUndefined(),
  unitOfMeasure: z.enum(['kg', 'g', 'ml', 'l', 'm', 'cm', 'un']).optional(),
  ncm: z.string()
    .regex(/^\d{8}$/, 'NCM deve conter exatamente 8 dígitos numéricos')
    .nullable()
    .optional()
    .transform(val => val === null || val === '' ? undefined : val),
  cfop: z.string()
    .regex(/^\d{4}$/, 'CFOP deve conter exatamente 4 dígitos numéricos')
    .nullable()
    .optional()
    .transform(val => val === null || val === '' ? undefined : val),
});

// Schema para formulário de produto (inclui campos opcionais para edição)
export const productFormSchema = z.object({
  id: z.string().optional(), // Aceita qualquer formato de ID
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(255),
  barcode: z.string().min(8, 'Código de barras inválido').max(20),
  price: z.number().positive('Preço deve ser positivo'),
  costPrice: z.number().positive('Preço de custo deve ser positivo').optional(),
  stockQuantity: z.number().min(0, 'Quantidade não pode ser negativa'),
  minStockQuantity: z.number().min(0, 'Quantidade mínima não pode ser negativa').optional(),
  category: optionalStringOrUndefined(),
  description: optionalStringOrUndefined(),
  expirationDate: optionalStringOrUndefined(),
  unitOfMeasure: z.enum(['kg', 'g', 'ml', 'l', 'm', 'cm', 'un']).nullable().optional(),
  ncm: z.string()
    .regex(/^\d{8}$/, 'NCM deve conter exatamente 8 dígitos numéricos')
    .nullable()
    .optional()
    .transform(val => val === null || val === '' ? undefined : val),
  cfop: z.string()
    .regex(/^\d{4}$/, 'CFOP deve conter exatamente 4 dígitos numéricos')
    .nullable()
    .optional()
    .transform(val => val === null || val === '' ? undefined : val),
  activityId: z.any().optional(), // Aceita qualquer tipo para evitar validação de UUID
  companyId: z.any().optional(), // Aceita qualquer tipo para evitar validação de UUID
});

// Sale Schemas
export const saleItemSchema = z.object({
  productId: z.string().min(1, 'ID do produto é obrigatório'),
  quantity: z.number().positive('Quantidade deve ser positiva'),
});

export const paymentMethodDetailSchema = z.object({
  method: z.enum(['cash', 'credit_card', 'debit_card', 'pix', 'installment']),
  amount: z.number().positive('Valor deve ser positivo'),
});

export const installmentDataSchema = z.object({
  installments: z.number().min(1, 'Mínimo 1 parcela').max(24, 'Máximo 24 parcelas'),
  installmentValue: z.number().positive('Valor da parcela deve ser positivo'),
  firstDueDate: z.date({ required_error: 'Data do primeiro vencimento é obrigatória' }),
  description: optionalStringOrUndefined(),
});

export const paymentMethodSchema = z.object({
  method: z.enum(['cash', 'credit_card', 'debit_card', 'pix', 'installment']),
  amount: z.number().positive('Valor deve ser positivo'),
  additionalInfo: optionalStringOrUndefined(),
});

export const saleSchema = z.object({
  items: z.array(saleItemSchema).min(1, 'Adicione pelo menos um produto'),
  paymentMethods: z.array(paymentMethodSchema).min(1, 'Selecione pelo menos uma forma de pagamento'),
  clientName: optionalString(),
  clientCpfCnpj: optionalString(),
  sellerId: z.string().optional(), // Aceita qualquer formato de ID
});

// Customer Schemas
export const customerAddressSchema = z.object({
  street: z.string().min(2, 'Rua deve ter no mínimo 2 caracteres'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: optionalString(),
  neighborhood: z.string().min(2, 'Bairro deve ter no mínimo 2 caracteres'),
  city: z.string().min(2, 'Cidade deve ter no mínimo 2 caracteres'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
});

export const customerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(255),
  email: optionalString(),
  phone: optionalString(),
  cpfCnpj: optionalString(),
  // Campos de endereço individuais para o formulário
  street: optionalString(),
  number: optionalString(),
  complement: optionalString(),
  city: optionalString(),
  state: optionalString(),
  zipCode: optionalString(),
});

// Bill Schemas
export const billSchema = z.object({
  title: z.string().min(2, 'Título deve ter no mínimo 2 caracteres'),
  amount: z.number().positive('Valor deve ser positivo'),
  dueDate: z.string().min(1, 'Data de vencimento é obrigatória'),
  barcode: optionalString(),
  paymentInfo: optionalString(),
});

// Cash Closure Schemas
export const openCashClosureSchema = z.object({
  openingBalance: z.number().min(0, 'Saldo inicial não pode ser negativo'),
});

export const closeCashClosureSchema = z.object({
  closingBalance: z.number().min(0, 'Saldo final não pode ser negativo'),
});

// Seller Schemas
export const createSellerSchema = z.object({
  login: z.string().email('Login deve ser um email válido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(255),
  cpf: z.string()
    .nullable()
    .transform(val => val ?? '')
    .refine((val) => val === '' || /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(val), {
      message: 'CPF deve estar no formato XXX.XXX.XXX-XX'
    })
    .optional(),
  birthDate: z.string()
    .nullable()
    .transform(val => val ?? '')
    .refine((val) => {
      if (val === '') return true;
      try {
        // Aceita tanto YYYY-MM-DD quanto ISO 8601
        const date = new Date(val);
        return !isNaN(date.getTime());
      } catch {
        return false;
      }
    }, {
      message: 'Data de nascimento deve ser uma data válida'
    })
    .optional(),
  email: z.string()
    .nullable()
    .transform(val => val ?? '')
    .refine((val) => val === '' || z.string().email().safeParse(val).success, {
      message: 'Email deve ser um email válido'
    })
    .optional(),
  phone: z.string()
    .nullable()
    .transform(val => val ?? '')
    .refine((val) => val === '' || /^\(\d{2}\) \d{4,5}-\d{4}$/.test(val), {
      message: 'Telefone deve estar no formato (XX) XXXXX-XXXX'
    })
    .optional(),
  hasIndividualCash: z.boolean().optional(),
});

export const updateSellerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(255).optional(),
  cpf: z.string()
    .nullable()
    .transform(val => val ?? '')
    .refine((val) => val === '' || /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(val), {
      message: 'CPF deve estar no formato XXX.XXX.XXX-XX'
    })
    .optional(),
  birthDate: z.string()
    .nullable()
    .transform(val => val ?? '')
    .refine((val) => {
      if (val === '') return true;
      try {
        // Aceita tanto YYYY-MM-DD quanto ISO 8601
        const date = new Date(val);
        return !isNaN(date.getTime());
      } catch {
        return false;
      }
    }, {
      message: 'Data de nascimento deve ser uma data válida'
    })
    .optional(),
  email: z.string()
    .nullable()
    .transform(val => val ?? '')
    .refine((val) => val === '' || z.string().email().safeParse(val).success, {
      message: 'Email deve ser um email válido'
    })
    .optional(),
  phone: z.string()
    .nullable()
    .transform(val => val ?? '')
    .refine((val) => val === '' || /^\(\d{2}\) \d{4,5}-\d{4}$/.test(val), {
      message: 'Telefone deve estar no formato (XX) XXXXX-XXXX'
    })
    .optional(),
  password: z.string()
    .nullable()
    .transform(val => val ?? '')
    .refine((val) => val === '' || val.length >= 6, {
      message: 'Senha deve ter no mínimo 6 caracteres'
    })
    .optional(),
  confirmPassword: optionalString(),
  hasIndividualCash: z.boolean().optional(),
  commissionRate: z.number().min(0).max(100).optional(),
}).refine((data) => {
  if (data.password && data.password !== '') {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export const updateSellerProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(255).optional(),
  cpf: z.string()
    .nullable()
    .transform(val => val ?? '')
    .refine((val) => val === '' || /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(val), {
      message: 'CPF deve estar no formato XXX.XXX.XXX-XX'
    })
    .optional(),
  birthDate: optionalString(),
  email: z.string()
    .nullable()
    .transform(val => val ?? '')
    .refine((val) => val === '' || z.string().email().safeParse(val).success, {
      message: 'Email inválido'
    })
    .optional(),
  phone: z.string()
    .nullable()
    .transform(val => val ?? '')
    .refine((val) => val === '' || /^\(\d{2}\) \d{4,5}-\d{4}$/.test(val), {
      message: 'Telefone deve estar no formato (XX) XXXXX-XXXX'
    })
    .optional(),
});

// Installment Sale Schemas
export const installmentSaleSchema = z.object({
  description: optionalStringOrUndefined(),
});

// Report Schemas
export const reportSchema = z
  .object({
    reportType: z.enum(['sales', 'products', 'invoices', 'complete']),
    format: z.enum(['json', 'xml', 'excel']),
    startDate: optionalString(),
    endDate: optionalString(),
    sellerId: optionalString(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'Data final deve ser maior que data inicial',
      path: ['endDate'],
    }
  );

// User Types
export type UserRole = 'admin' | 'empresa' | 'vendedor';

export interface User {
  id: string;
  name: string;
  email?: string;
  login?: string;
  role: UserRole;
  companyId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  brandColor?: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Admin Types
export interface Admin {
  id: string;
  login: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  minStockQuantity?: number;
  category?: string;
  description?: string;
  photos?: string[];
  expirationDate?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

// Sale Types
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'installment';

export interface PaymentMethodDetail {
  method: PaymentMethod;
  amount: number;
}

export interface SaleItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  saleNumber: string;
  items: SaleItem[];
  total: number;
  discount?: number;
  paymentMethods: PaymentMethod[];
  paymentMethodDetails?: PaymentMethodDetail[];
  totalPaid?: number;
  change?: number;
  clientName?: string;
  customerId?: string;
  sellerId: string;
  seller?: User;
  companyId: string;
  cashClosureId?: string;
  createdAt: string;
  updatedAt: string;
}

// Seller Types
export interface Seller {
  id: string;
  login: string;
  name: string;
  cpf?: string;
  birthDate?: string;
  email?: string;
  phone?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  // Campos adicionais para estatísticas
  totalSales?: number;
  totalRevenue?: number;
  averageSaleValue?: number;
}

export interface SellerStats {
  totalSales: number;
  totalRevenue: number;
  averageSaleValue: number;
  salesByPeriod: {
    date: string;
    total: number;
    revenue: number;
  }[];
  topProducts: {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }[];
}

export interface SellerSalesResponse {
  data: Sale[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Customer Types
export interface CustomerAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cpfCnpj?: string;
  address?: CustomerAddress;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

// Bill to Pay Types
export interface BillToPay {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paidAt?: string;
  barcode?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

// Cash Closure Types
export interface CashClosure {
  id: string;
  openedAt: string;
  closedAt?: string;
  openingBalance?: number; // Campo principal
  openingAmount?: number;  // Campo alternativo da API
  closingBalance?: number;
  totalSales?: number;
  totalCash?: number;
  totalCard?: number;
  totalPix?: number;
  sellerId: string;
  seller?: User;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

// Report Types
export type ReportType = 'sales' | 'products' | 'invoices' | 'complete';
export type ReportFormat = 'json' | 'xml' | 'excel';

export interface GenerateReportDto {
  reportType: ReportType;
  format: ReportFormat;
  startDate?: string;
  endDate?: string;
  sellerId?: string;
}

export interface ReportHistory {
  id: string;
  type: ReportType;
  format: ReportFormat;
  date: string;
  size: number;
  filename: string;
}

// Dashboard Metrics
export interface DashboardMetrics {
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockProducts: number;
  upcomingBills: number;
  salesByPeriod: {
    date: string;
    total: number;
  }[];
  topProducts: {
    product: Product;
    quantity: number;
    revenue: number;
  }[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form DTOs
export interface LoginDto {
  login: string;
  password: string;
}

export interface CreateProductDto {
  id?: string; // UUID opcional para garantir compatibilidade
  name: string;
  barcode: string;
  price: number;
  stockQuantity: number;
  category?: string;
  photos?: string[];
  expirationDate?: string;
}

export interface InstallmentData {
  installments: number;
  installmentValue: number;
  firstDueDate: string;
  description?: string;
}

export interface CreateSaleDto {
  items: {
    productId: string;
    quantity: number;
  }[];
  paymentMethods: {
    method: PaymentMethod;
    amount: number;
    additionalInfo?: string;
  }[];
  clientName?: string;
  clientCpfCnpj?: string;
  sellerId?: string; // ID do vendedor quando vendido por empresa
}

export interface CreateCustomerDto {
  name: string;
  email?: string;
  phone?: string;
  cpfCnpj?: string;
  // Campos de endereço individuais
  street?: string;
  number?: string;
  complement?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface CreateSellerDto {
  login: string;
  password: string;
  name: string;
  cpf?: string;
  birthDate?: string;
  email?: string;
  phone?: string;
}

export interface UpdateSellerDto {
  name?: string;
  cpf?: string;
  birthDate?: string;
  email?: string;
  phone?: string;
  activityId?: string; // UUID para rastreamento de atividades
}

export interface UpdateSellerProfileDto {
  name?: string;
  cpf?: string;
  birthDate?: string;
  email?: string;
  phone?: string;
}

export interface CreateBillDto {
  title: string; // API usa "title" ao invés de "description"
  amount: number;
  dueDate: string;
  barcode?: string;
  paymentInfo?: string;
  activityId?: string; // UUID para rastreamento de atividades
}

export interface CreateCompanyDto {
  // Campos obrigatórios
  name: string;
  login: string;
  password: string;
  cnpj: string;
  email: string;
  
  // Campos opcionais - dados básicos
  phone?: string;
  stateRegistration?: string;
  municipalRegistration?: string;
  
  // Campos opcionais - visual
  logoUrl?: string;
  brandColor?: string;
  
  // Campos opcionais - endereço
  zipCode?: string;
  state?: string;
  city?: string;
  district?: string;
  street?: string;
  number?: string;
  complement?: string;
  
  // Campos opcionais - dados bancários
  beneficiaryName?: string;
  beneficiaryCpfCnpj?: string;
  bankCode?: string;
  bankName?: string;
  agency?: string;
  accountNumber?: string;
  accountType?: 'corrente' | 'poupança' | 'pagamento';
}

export interface CreateAdminDto {
  login: string;
  password: string;
  name: string;
  email: string;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  discount: number;
}

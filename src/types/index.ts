// User Types
export type UserRole = 'admin' | 'empresa' | 'vendedor' | 'gestor';

export interface User {
  id: string;
  name: string;
  fantasyName?: string | null;
  email?: string;
  login?: string;
  role: UserRole;
  companyId?: string | null;
  companyIds?: string[];
  plan?: PlanType;
  dataPeriod?: DataPeriodFilter | null;
  nfeEmissionEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Plan Types
export enum PlanType {
  PRO = 'PRO',
  TRIAL_7_DAYS = 'TRIAL_7_DAYS',
}

// Auth Types
export interface LoginDto {
  login: string;
  password: string;
}

// Data Period Filter Types
export type DataPeriodFilter =
  | 'TODAY'
  | 'THIS_WEEK'
  | 'LAST_15_DAYS'
  | 'LAST_1_MONTH'
  | 'LAST_3_MONTHS'
  | 'LAST_6_MONTHS'
  | 'THIS_YEAR'
  | 'ALL';

// Company Types
export interface Company {
  id: string;
  name: string;
  fantasyName?: string | null;
  login: string;
  cnpj: string;
  email: string;
  phone?: string;
  plan?: PlanType;
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
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Plan Limits Configuration
  maxProducts?: number | null;
  maxCustomers?: number | null;
  maxSellers?: number | null;
  photoUploadEnabled?: boolean;
  maxPhotosPerProduct?: number | null;
  nfceEmissionEnabled?: boolean;
  nfeEmissionEnabled?: boolean;
  // Feature Permissions
  catalogPageAllowed?: boolean;
  autoMessageAllowed?: boolean;
  boletoAllowed?: boolean;
  // Installment Configuration
  installmentInterestRates?: Record<string, number>;
  maxInstallments?: number;
  // Termos de uso aceitos pela empresa
  termsAccepted?: boolean | null;
}

export interface CreateCompanyDto {
  name: string;
  fantasyName?: string;
  login: string;
  password?: string;
  cnpj: string;
  email: string;
  phone?: string;
  stateRegistration?: string;
  municipalRegistration?: string;
  plan?: PlanType;
  logoUrl?: string;
  brandColor?: string;
  zipCode?: string;
  state?: string;
  city?: string;
  district?: string;
  street?: string;
  number?: string;
  complement?: string;
  beneficiaryName?: string;
  beneficiaryCpfCnpj?: string;
  bankCode?: string;
  bankName?: string;
  agency?: string;
  accountNumber?: string;
  accountType?: 'corrente' | 'poupança' | 'pagamento';
  maxProducts?: number | null;
  maxCustomers?: number | null;
  maxSellers?: number | null;
  photoUploadEnabled?: boolean;
  maxPhotosPerProduct?: number | null;
  nfceEmissionEnabled?: boolean;
  nfeEmissionEnabled?: boolean;
  catalogPageAllowed?: boolean;
  autoMessageAllowed?: boolean;
  boletoAllowed?: boolean;
}

// Product Types
export interface StockEntry {
  id: string;
  quantity: number;
  expirationDate: string | null;
  batchNumber: string | null;
  unitCost: number;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  minStockQuantity?: number;
  lowStockAlertThreshold?: number;
  category?: string;
  description?: string;
  photos?: string[];
  expirationDate?: string;
  nearestExpirationDate?: string | null;
  unitOfMeasure?: string;
  ncm?: string;
  cfop?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  // Promotion fields
  promotionPrice?: number;
  promotionDiscount?: number;
  isOnPromotion?: boolean;
  promotionName?: string;
  originalPrice?: number;
  // Batch stock entries
  stockEntries?: StockEntry[];
}

// Payment Types
export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'installment' | 'store_credit' | 'loss';

export interface PaymentMethodDetail {
  method: PaymentMethod;
  amount: number;
  customerId?: string;
  installments?: number;
  firstDueDate?: Date;
  description?: string;
  cardIntegrationType?: string;
  acquirerCnpj?: string;
  cardBrand?: string;
  cardOperationType?: string;
  installmentCount?: number;
}

export interface InstallmentData {
  installments: number;
  installmentValue: number;
  firstDueDate: Date;
  description?: string;
}

// Sale Types
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
  seller?: any; // User type
  companyId: string;
  cashClosureId?: string;
  createdAt: string;
  updatedAt: string;
  exchanges?: Exchange[];
}

export interface CreateSaleDto {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  paymentMethods: Array<{
    method: PaymentMethod;
    amount: number;
    additionalInfo?: string;
  }>;
  clientName?: string;
  clientCpfCnpj?: string;
  sellerId?: string;
  installmentData?: InstallmentData;
  discount?: number;
  /** Usado quando emitOnlyNfe está ativo: emitir boleto para esta venda */
  emitBoleto?: boolean;
  /** Data de vencimento preferencial do boleto (ISO date). Obrigatório se emitBoleto = true. */
  boletoDueDate?: string;
  /** ID do cliente cadastrado para o boleto. Obrigatório se emitBoleto = true. */
  boletoCustomerId?: string;
}

// Exchange Types
export type ExchangePaymentType = 'PAYMENT' | 'REFUND';
export type ExchangeStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface ExchangePayment {
  id: string;
  method: PaymentMethod;
  amount: number;
  additionalInfo?: string;
  createdAt: string;
  type?: ExchangePaymentType;
}

export interface ExchangeFiscalDocument {
  id: string;
  documentType: string;
  origin?: string;
  documentNumber?: string | null;
  accessKey?: string | null;
  status?: string;
  totalValue?: number;
  pdfUrl?: string | null;
  qrCodeUrl?: string | null;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface ExchangeDeliveredItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    id: string;
    name: string;
    barcode?: string | null;
  } | null;
}

export interface ExchangeReturnedItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  saleItemId?: string | null;
  product?: {
    id: string;
    name: string;
    barcode?: string | null;
  } | null;
  saleItem?: {
    id: string;
    quantity: number;
    unitPrice: number;
    product?: {
      id: string;
      name: string;
      barcode?: string | null;
    } | null;
  } | null;
}

export interface Exchange {
  id: string;
  reason: string;
  note?: string | null;
  exchangeDate: string;
  returnedTotal: number;
  deliveredTotal: number;
  difference: number;
  storeCreditAmount: number;
  status: ExchangeStatus;
  processedBy?: {
    id: string;
    name: string;
  } | null;
  returnedItems: ExchangeReturnedItem[];
  deliveredItems: ExchangeDeliveredItem[];
  payments: ExchangePayment[];
  refunds: ExchangePayment[];
  createdAt: string;
  fiscalDocuments?: ExchangeFiscalDocument[];
  returnFiscalDocument?: ExchangeFiscalDocument | null;
  deliveryFiscalDocument?: ExchangeFiscalDocument | null;
  fiscalWarnings?: string[];
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
  commissionRate?: number;
  hasIndividualCash?: boolean;
  nfeEmissionEnabled?: boolean;
  companyId: string;
  createdAt: string;
  updatedAt: string;
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

export interface UpdateSellerProfileDto {
  name?: string;
  cpf?: string;
  birthDate?: string;
  email?: string;
  phone?: string;
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
  phone?: string;
  email?: string;
  cpfCnpj?: string;
  storeCreditBalance?: number;
  address?: CustomerAddress;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  name: string;
  email?: string;
  phone?: string;
  cpfCnpj?: string;
  street?: string;
  number?: string;
  complement?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

// Bill Types
export interface BillToPay {
  id: string;
  title?: string;
  description?: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paidAt?: string;
  barcode?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export type BillRecurrenceType = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export interface CreateBillDto {
  title: string;
  amount: number;
  dueDate: string;
  barcode?: string;
  paymentInfo?: string;
  recurrenceType?: BillRecurrenceType;
  recurrenceEndDate?: string;
}

export interface BillRecurrence {
  id: string;
  companyId: string;
  title: string;
  barcode?: string | null;
  paymentInfo?: string | null;
  amount: number;
  recurrenceType: BillRecurrenceType;
  endDate?: string | null;
  nextDueDate: string;
  createdAt: string;
  updatedAt: string;
}

// Store Credit Types
export interface StoreCreditBalance {
  customerId: string;
  customerName: string;
  cpfCnpj?: string;
  balance: number;
}

export interface StoreCreditTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  createdAt: string;
  exchangeId?: string;
  saleId?: string;
}

export interface StoreCreditTransactionsResponse {
  transactions: StoreCreditTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Plan Usage Types
export interface PlanLimits {
  maxProducts: number | null;
  maxSellers: number | null;
  maxBillsToPay: number | null;
}

export interface PlanWarnings {
  nearLimit: boolean;
  warnings: string[];
}

export interface PlanUsageStats {
  plan: PlanType;
  limits: PlanLimits;
  usage: {
    products: {
      current: number;
      max: number | null;
      percentage: number;
      available: number | null;
    };
    sellers: {
      current: number;
      max: number | null;
      percentage: number;
      available: number | null;
    };
    billsToPay: {
      current: number;
      max: number | null;
      percentage: number;
      available: number | null;
    };
  };
}

// Report Types
export type ReportType = 'sales' | 'products' | 'invoices' | 'inbound_invoices' | 'complete' | 'cancelled_sales' | 'sales_with_fiscal' | 'sales_without_fiscal';
export type ReportFormat = 'json' | 'xml' | 'excel';

export interface GenerateReportDto {
  reportType: ReportType;
  format: ReportFormat;
  startDate?: string;
  endDate?: string;
  sellerId?: string;
  includeDocuments?: boolean;
}

// Enum para filtros de período
export enum ReportHistoryPeriodFilter {
  THIS_MONTH = 'THIS_MONTH',
  LAST_3_MONTHS = 'LAST_3_MONTHS',
  LAST_6_MONTHS = 'LAST_6_MONTHS',
  LAST_YEAR = 'LAST_YEAR',
}

// Interface atualizada de histórico
export interface ReportHistory {
  id: string;
  reportType: ReportType;
  format: ReportFormat;
  startDate?: string;
  endDate?: string;
  sellerId?: string;
  sellerName?: string;
  includeDocuments: boolean;
  filename: string;
  fileSize: number;
  generatedAt: string;
}

// Response com paginação
export interface ReportHistoryResponse {
  data: ReportHistory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// DTO Types
export interface CreateProductDto {
  id?: string;
  name: string;
  barcode: string;
  price: number;
  stockQuantity: number;
  category?: string;
  description?: string;
  photos?: string[];
  expirationDate?: string;
  unitOfMeasure?: 'kg' | 'g' | 'ml' | 'l' | 'm' | 'cm' | 'un';
  ncm?: string;
  cfop?: string;
  costPrice?: number;
  minStockQuantity?: number;
  lowStockAlertThreshold?: number;
}

export interface CreateSellerDto {
  login: string;
  password: string;
  name: string;
  cpf?: string;
  birthDate?: string;
  email?: string;
  phone?: string;
  commissionRate?: number;
  hasIndividualCash?: boolean;
  nfeEmissionEnabled?: boolean;
}

export interface UpdateSellerDto {
  name?: string;
  cpf?: string;
  birthDate?: string;
  email?: string;
  phone?: string;
  commissionRate?: number;
  hasIndividualCash?: boolean;
  nfeEmissionEnabled?: boolean;
  activityId?: string;
}

// Cart Types
export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Promotion Types
export interface Promotion {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  discountPercentage?: number;
  promotionalPrice?: number;
  isActive: boolean;
  products: Array<{
    id: string;
    name: string;
    originalPrice: number;
  }>;
  createdAt: string;
}

// ===========================
// Time Clock (Ponto Eletrônico)
// ===========================

export type TimeClockType = 'ENTRY' | 'LUNCH_OUT' | 'LUNCH_IN' | 'EXIT';
export type TimeClockStatus =
  | 'VALID'
  | 'PENDING_REVIEW'
  | 'REJECTED'
  | 'ADJUSTED';

export interface TimeClock {
  id: string;
  companyId: string;
  sellerId: string;
  type: TimeClockType;
  timestamp: string;
  latitude?: number | null;
  longitude?: number | null;
  accuracyMeters?: number | null;
  distanceMeters?: number | null;
  withinRadius?: boolean | null;
  qrTokenUsed?: string | null;
  status: TimeClockStatus;
  notes?: string | null;
  adjustedById?: string | null;
  adjustedByRole?: string | null;
  adjustedAt?: string | null;
  adjustmentReason?: string | null;
  deviceInfo?: Record<string, any> | null;
  seller?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TimeClockConfig {
  id: string;
  companyId: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  qrToken: string;
  requireQrCode: boolean;
  requireLocation: boolean;
  notifyOnEntryTime?: string | null;
  notifyOnLunchOutTime?: string | null;
  notifyOnLunchInTime?: string | null;
  notifyOnExitTime?: string | null;
  notificationsEnabled: boolean;
  lateToleranceMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimeClockDaySummary {
  date: string;
  punches: Array<{ type: TimeClockType; timestamp: string }>;
  workedMinutes: number;
  lateMinutes: number;
  overtimeMinutes: number;
  completed: boolean;
  status: 'NORMAL' | 'INCOMPLETE' | 'MISSED' | 'OFF';
}

export interface TimeClockTodayResponse {
  date: string;
  punches: Array<{ type: TimeClockType; timestamp: string; status: TimeClockStatus }>;
  nextExpected: TimeClockType | null;
  daySummary: TimeClockDaySummary | null;
  config: TimeClockConfig;
}

export interface TimeClockStats {
  month: string;
  totalDays: number;
  workedDays: number;
  missedDays: number;
  totalWorkedMinutes: number;
  totalLateMinutes: number;
  totalOvertimeMinutes: number;
  averageDailyMinutes: number;
}

export interface TimeClockQrCode {
  qrToken: string;
  dataUrl: string;
}

export interface RegisterTimeClockDto {
  type?: TimeClockType;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  qrToken?: string;
  deviceInfo?: Record<string, any>;
  notes?: string;
}

export interface UpdateTimeClockConfigDto {
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  requireQrCode?: boolean;
  requireLocation?: boolean;
  notifyOnEntryTime?: string | null;
  notifyOnLunchOutTime?: string | null;
  notifyOnLunchInTime?: string | null;
  notifyOnExitTime?: string | null;
  notificationsEnabled?: boolean;
  lateToleranceMinutes?: number;
}

export interface AdjustTimeClockDto {
  type?: TimeClockType;
  timestamp?: string;
  latitude?: number;
  longitude?: number;
  reason: string;
}

export interface RejectTimeClockDto {
  reason: string;
}

export interface TimeClockFilterDto {
  sellerId?: string;
  startDate?: string;
  endDate?: string;
  type?: TimeClockType;
  status?: TimeClockStatus;
  page?: number;
  limit?: number;
  companyId?: string;
}

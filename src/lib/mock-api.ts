// Mock API para testes sem backend
import type { User, Product, Sale, Customer, Seller, BillToPay, CashClosure } from '@/types';

export const MOCK_USERS = {
  admin: {
    login: 'admin@lojas.com',
    password: 'admin123',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440005',
      name: 'Administrador',
      email: 'admin@lojas.com',
      role: 'admin' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  empresa: {
    login: 'empresa@lojas.com',
    password: 'empresa123',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440006',
      name: 'Empresa Demo',
      email: 'empresa@lojas.com',
      role: 'empresa' as const,
      companyId: '550e8400-e29b-41d4-a716-446655440007',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  vendedor: {
    login: 'vendedor@lojas.com',
    password: 'vendedor123',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440008',
      name: 'Vendedor Demo',
      email: 'vendedor@lojas.com',
      role: 'vendedor' as const,
      companyId: '550e8400-e29b-41d4-a716-446655440007',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
};

export function mockLogin(login: string, password: string): Promise<{ user: User; token: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const mockUser = Object.values(MOCK_USERS).find(
        (u) => u.login === login && u.password === password
      );

      if (mockUser) {
        resolve({
          user: mockUser.user,
          token: 'mock-jwt-token-' + Date.now(),
        });
      } else {
        reject(new Error('Login ou senha inválidos'));
      }
    }, 1000);
  });
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Smartphone Samsung Galaxy',
    barcode: '7891234567890',
    price: 1299.99,
    costPrice: 800.00,
    stockQuantity: 50,
    minStockQuantity: 10,
    category: 'Eletrônicos',
    description: 'Smartphone com tela de 6.5 polegadas',
    photos: ['https://example.com/phone1.jpg'],
    expirationDate: '2025-12-31',
    companyId: '550e8400-e29b-41d4-a716-446655440007',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Notebook Dell Inspiron',
    barcode: '7891234567891',
    price: 2499.99,
    costPrice: 1800.00,
    stockQuantity: 25,
    minStockQuantity: 5,
    category: 'Informática',
    description: 'Notebook com processador Intel i5',
    photos: ['https://example.com/laptop1.jpg'],
    companyId: '550e8400-e29b-41d4-a716-446655440007',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Café em Grãos',
    barcode: '7891234567892',
    price: 29.90,
    costPrice: 15.00,
    stockQuantity: 100,
    minStockQuantity: 20,
    category: 'Alimentos',
    description: 'Café em grãos torrado',
    photos: ['https://example.com/coffee1.jpg'],
    expirationDate: '2024-12-31',
    companyId: '550e8400-e29b-41d4-a716-446655440007',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Ferro 40x40',
    barcode: '7891234567893',
    price: 45.90,
    costPrice: 25.00,
    stockQuantity: 75,
    minStockQuantity: 15,
    category: 'Construção',
    description: 'Ferro de construção 40x40mm',
    photos: ['https://example.com/iron1.jpg'],
    companyId: '550e8400-e29b-41d4-a716-446655440007',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-9999',
    cpfCnpj: '123.456.789-00',
    address: {
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 1',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
    },
    companyId: '550e8400-e29b-41d4-a716-446655440007',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '(11) 88888-8888',
    cpfCnpj: '987.654.321-00',
    address: {
      street: 'Av. Paulista',
      number: '456',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
    },
    companyId: '550e8400-e29b-41d4-a716-446655440007',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_SELLERS: Seller[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    login: 'vendedor1@lojas.com',
    name: 'Carlos Vendedor',
    cpf: '111.222.333-44',
    birthDate: '1990-05-15',
    email: 'carlos@lojas.com',
    phone: '(11) 77777-7777',
    companyId: '550e8400-e29b-41d4-a716-446655440007',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalSales: 150,
    totalRevenue: 45000,
    averageSaleValue: 300,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440013',
    login: 'vendedor2@lojas.com',
    name: 'Ana Vendedora',
    cpf: '555.666.777-88',
    birthDate: '1985-08-20',
    email: 'ana@lojas.com',
    phone: '(11) 66666-6666',
    companyId: '550e8400-e29b-41d4-a716-446655440007',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalSales: 200,
    totalRevenue: 60000,
    averageSaleValue: 300,
  },
];

export const MOCK_SALES: Sale[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440015',
    saleNumber: 'V001',
    items: [
      {
        id: '1',
        productId: '550e8400-e29b-41d4-a716-446655440000',
        product: MOCK_PRODUCTS[0],
        quantity: 1,
        unitPrice: 1299.99,
        subtotal: 1299.99,
      },
    ],
    total: 1299.99,
    discount: 0,
    paymentMethods: ['cash'],
    paymentMethodDetails: [
      { method: 'cash', amount: 1299.99 },
    ],
    totalPaid: 1299.99,
    change: 0,
    clientName: 'João Silva',
    customerId: '550e8400-e29b-41d4-a716-446655440010',
    sellerId: '550e8400-e29b-41d4-a716-446655440012',
    seller: MOCK_SELLERS[0],
    companyId: '550e8400-e29b-41d4-a716-446655440007',
    cashClosureId: '550e8400-e29b-41d4-a716-446655440020',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_BILLS: BillToPay[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440016',
    description: 'Conta de luz - Janeiro 2024',
    amount: 150.75,
    dueDate: '2024-02-15',
    isPaid: false,
    barcode: '12345678901234567890',
    companyId: '550e8400-e29b-41d4-a716-446655440007',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440017',
    description: 'Aluguel - Janeiro 2024',
    amount: 2500.00,
    dueDate: '2024-02-05',
    isPaid: true,
    paidAt: '2024-02-03',
    barcode: '98765432109876543210',
    companyId: '550e8400-e29b-41d4-a716-446655440007',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_CASH_CLOSURES: CashClosure[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440020',
    openedAt: '2024-01-15T08:00:00.000Z',
    closedAt: '2024-01-15T18:00:00.000Z',
    openingBalance: 100.00,
    closingBalance: 1500.00,
    totalSales: 1400.00,
    totalCash: 1200.00,
    totalCard: 200.00,
    totalPix: 0,
    sellerId: '550e8400-e29b-41d4-a716-446655440012',
    seller: MOCK_SELLERS[0],
    companyId: '550e8400-e29b-41d4-a716-446655440007',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_DASHBOARD_METRICS = {
  totalSales: 150,
  totalRevenue: 45000,
  totalProducts: 250,
  totalCustomers: 80,
  lowStockProducts: 5,
  upcomingBills: 3,
  salesByPeriod: [
    { date: '2024-01-01', total: 5000 },
    { date: '2024-01-02', total: 6500 },
    { date: '2024-01-03', total: 4800 },
    { date: '2024-01-04', total: 7200 },
    { date: '2024-01-05', total: 8100 },
    { date: '2024-01-06', total: 6900 },
    { date: '2024-01-07', total: 7500 },
  ],
  topProducts: [
    { product: MOCK_PRODUCTS[0], quantity: 45, revenue: 1345.50 },
    { product: MOCK_PRODUCTS[1], quantity: 38, revenue: 1896.20 },
  ],
};

// Funções auxiliares para simular respostas da API
export function mockApiResponse<T>(data: T, delay: number = 500): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}

export function mockApiError(message: string, status: number = 400, delay: number = 500): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      const error = new Error(message);
      (error as any).response = { status, data: { message } };
      reject(error);
    }, delay);
  });
}

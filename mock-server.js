/**
 * Mock Server para Testes da API MontShop
 * 
 * Este servidor simula todas as rotas da API para permitir testes reais
 * sem necessidade de um backend real.
 */

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock data
const mockUsers = {
  admin: {
    id: '550e8400-e29b-41d4-a716-446655440005',
    login: 'admin@lojas.com',
    password: 'admin123',
    name: 'Administrador',
    email: 'admin@lojas.com',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  empresa: {
    id: '550e8400-e29b-41d4-a716-446655440006',
    login: 'empresa@lojas.com',
    password: 'empresa123',
    name: 'Empresa Demo',
    email: 'empresa@lojas.com',
    role: 'empresa',
    companyId: '550e8400-e29b-41d4-a716-446655440007',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  vendedor: {
    id: '550e8400-e29b-41d4-a716-446655440008',
    login: 'vendedor@lojas.com',
    password: 'vendedor123',
    name: 'Vendedor Demo',
    email: 'vendedor@lojas.com',
    role: 'vendedor',
    companyId: '550e8400-e29b-41d4-a716-446655440007',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

const mockProducts = [
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

const mockCustomers = [
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
];

const mockSellers = [
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
];

const mockSales = [
  {
    id: '550e8400-e29b-41d4-a716-446655440015',
    saleNumber: 'V001',
    items: [
      {
        id: '1',
        productId: '550e8400-e29b-41d4-a716-446655440000',
        product: mockProducts[0],
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
    seller: mockSellers[0],
    companyId: '550e8400-e29b-41d4-a716-446655440007',
    cashClosureId: '550e8400-e29b-41d4-a716-446655440020',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockBills = [
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
];

const mockCashClosures = [
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
    seller: mockSellers[0],
    companyId: '550e8400-e29b-41d4-a716-446655440007',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper functions
function generateToken(user) {
  return `mock-jwt-token-${user.id}-${Date.now()}`;
}

function findUserByLogin(login, password) {
  return Object.values(mockUsers).find(
    user => user.login === login && user.password === password
  );
}

function findProductByBarcode(barcode) {
  return mockProducts.find(product => product.barcode === barcode);
}

function findCustomerByCpfCnpj(cpfCnpj) {
  return mockCustomers.find(customer => customer.cpfCnpj === cpfCnpj);
}

// ============================================================================
// AUTH ROUTES
// ============================================================================

app.post('/api/auth/login', (req, res) => {
  const { login, password } = req.body;
  
  if (!login || !password) {
    return res.status(400).json({ message: 'Login e senha são obrigatórios' });
  }
  
  const user = findUserByLogin(login, password);
  
  if (!user) {
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }
  
  const token = generateToken(user);
  
  res.json({
    access_token: token,
    user: {
      id: user.id,
      login: user.login,
      role: user.role,
      companyId: user.companyId,
      name: user.name,
    },
  });
});

app.post('/api/auth/refresh', (req, res) => {
  // Simular refresh token
  const token = generateToken(mockUsers.empresa);
  
  res.json({
    access_token: token,
    user: {
      id: mockUsers.empresa.id,
      login: mockUsers.empresa.login,
      role: mockUsers.empresa.role,
      companyId: mockUsers.empresa.companyId,
      name: mockUsers.empresa.name,
    },
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

// ============================================================================
// PRODUCT ROUTES
// ============================================================================

app.get('/api/product', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  res.json({
    data: mockProducts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: mockProducts.length,
      totalPages: Math.ceil(mockProducts.length / limit),
    },
  });
});

app.get('/api/product/barcode/:barcode', (req, res) => {
  const { barcode } = req.params;
  const product = findProductByBarcode(barcode);
  
  if (!product) {
    return res.status(404).json({ message: 'Produto não encontrado' });
  }
  
  res.json(product);
});

app.get('/api/product/categories', (req, res) => {
  const categories = [...new Set(mockProducts.map(p => p.category))];
  res.json(categories);
});

app.get('/api/product/stats', (req, res) => {
  res.json({
    totalProducts: mockProducts.length,
    totalValue: mockProducts.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0),
    lowStockCount: mockProducts.filter(p => p.stockQuantity <= p.minStockQuantity).length,
    categories: [...new Set(mockProducts.map(p => p.category))].length,
  });
});

app.get('/api/product/low-stock', (req, res) => {
  const { threshold = 10 } = req.query;
  const lowStockProducts = mockProducts.filter(p => p.stockQuantity <= threshold);
  res.json(lowStockProducts);
});

app.get('/api/product/expiring', (req, res) => {
  const { days = 30 } = req.query;
  const expiringProducts = mockProducts.filter(p => {
    if (!p.expirationDate) return false;
    const expirationDate = new Date(p.expirationDate);
    const today = new Date();
    const diffDays = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));
    return diffDays <= days && diffDays >= 0;
  });
  res.json(expiringProducts);
});

// ============================================================================
// SALE ROUTES
// ============================================================================

app.get('/api/sale', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  res.json({
    data: mockSales,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: mockSales.length,
      totalPages: Math.ceil(mockSales.length / limit),
    },
  });
});

app.get('/api/sale/stats', (req, res) => {
  res.json({
    totalSales: mockSales.length,
    totalRevenue: mockSales.reduce((sum, s) => sum + s.total, 0),
    averageSaleValue: mockSales.length > 0 ? mockSales.reduce((sum, s) => sum + s.total, 0) / mockSales.length : 0,
    salesByPeriod: [
      { date: '2024-01-01', total: 5000 },
      { date: '2024-01-02', total: 6500 },
    ],
  });
});

app.get('/api/sale/my-sales', (req, res) => {
  // Simular que é um vendedor
  res.json({
    data: mockSales,
    pagination: {
      page: 1,
      limit: 10,
      total: mockSales.length,
      totalPages: 1,
    },
  });
});

app.get('/api/sale/my-stats', (req, res) => {
  res.json({
    totalSales: mockSales.length,
    totalRevenue: mockSales.reduce((sum, s) => sum + s.total, 0),
    averageSaleValue: mockSales.length > 0 ? mockSales.reduce((sum, s) => sum + s.total, 0) / mockSales.length : 0,
  });
});

// ============================================================================
// CUSTOMER ROUTES
// ============================================================================

app.get('/api/customer', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  res.json({
    data: mockCustomers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: mockCustomers.length,
      totalPages: Math.ceil(mockCustomers.length / limit),
    },
  });
});

app.get('/api/customer/stats', (req, res) => {
  res.json({
    totalCustomers: mockCustomers.length,
    activeCustomers: mockCustomers.length,
    newCustomersThisMonth: 0,
  });
});

app.get('/api/customer/cpf-cnpj/:cpfCnpj', (req, res) => {
  const { cpfCnpj } = req.params;
  const customer = findCustomerByCpfCnpj(cpfCnpj);
  
  if (!customer) {
    return res.status(404).json({ message: 'Cliente não encontrado' });
  }
  
  res.json(customer);
});

// ============================================================================
// SELLER ROUTES
// ============================================================================

app.get('/api/seller', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  res.json({
    data: mockSellers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: mockSellers.length,
      totalPages: Math.ceil(mockSellers.length / limit),
    },
  });
});

app.get('/api/seller/my-profile', (req, res) => {
  res.json(mockSellers[0]);
});

app.get('/api/seller/my-stats', (req, res) => {
  res.json({
    totalSales: mockSellers[0].totalSales,
    totalRevenue: mockSellers[0].totalRevenue,
    averageSaleValue: mockSellers[0].averageSaleValue,
  });
});

app.get('/api/seller/my-sales', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  res.json({
    data: mockSales,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: mockSales.length,
      totalPages: Math.ceil(mockSales.length / limit),
    },
  });
});

// ============================================================================
// BILL TO PAY ROUTES
// ============================================================================

app.get('/api/bill-to-pay', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  res.json({
    data: mockBills,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: mockBills.length,
      totalPages: Math.ceil(mockBills.length / limit),
    },
  });
});

app.get('/api/bill-to-pay/stats', (req, res) => {
  res.json({
    totalBills: mockBills.length,
    totalAmount: mockBills.reduce((sum, b) => sum + b.amount, 0),
    paidBills: mockBills.filter(b => b.isPaid).length,
    unpaidBills: mockBills.filter(b => !b.isPaid).length,
  });
});

app.get('/api/bill-to-pay/overdue', (req, res) => {
  const today = new Date();
  const overdueBills = mockBills.filter(bill => {
    const dueDate = new Date(bill.dueDate);
    return dueDate < today && !bill.isPaid;
  });
  res.json(overdueBills);
});

app.get('/api/bill-to-pay/upcoming', (req, res) => {
  const { days = 7 } = req.query;
  const today = new Date();
  const upcomingDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
  
  const upcomingBills = mockBills.filter(bill => {
    const dueDate = new Date(bill.dueDate);
    return dueDate >= today && dueDate <= upcomingDate && !bill.isPaid;
  });
  
  res.json(upcomingBills);
});

// ============================================================================
// CASH CLOSURE ROUTES
// ============================================================================

app.get('/api/cash-closure/current', (req, res) => {
  const currentClosure = mockCashClosures.find(c => !c.closedAt);
  
  if (!currentClosure) {
    return res.status(404).json({ message: 'Nenhum fechamento ativo' });
  }
  
  res.json(currentClosure);
});

app.get('/api/cash-closure', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  res.json({
    data: mockCashClosures,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: mockCashClosures.length,
      totalPages: Math.ceil(mockCashClosures.length / limit),
    },
  });
});

app.get('/api/cash-closure/stats', (req, res) => {
  res.json({
    totalClosures: mockCashClosures.length,
    totalSales: mockCashClosures.reduce((sum, c) => sum + c.totalSales, 0),
    totalCash: mockCashClosures.reduce((sum, c) => sum + c.totalCash, 0),
    totalCard: mockCashClosures.reduce((sum, c) => sum + c.totalCard, 0),
  });
});

app.get('/api/cash-closure/history', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  res.json({
    data: mockCashClosures,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: mockCashClosures.length,
      totalPages: Math.ceil(mockCashClosures.length / limit),
    },
  });
});

// ============================================================================
// REPORTS ROUTES
// ============================================================================

app.post('/api/reports/generate', (req, res) => {
  const { reportType, format, startDate, endDate } = req.body;
  
  if (!reportType || !format) {
    return res.status(400).json({ message: 'Tipo de relatório e formato são obrigatórios' });
  }
  
  // Simular geração de relatório
  const reportData = {
    reportType,
    format,
    startDate,
    endDate,
    generatedAt: new Date().toISOString(),
    data: mockSales,
  };
  
  if (format === 'json') {
    res.json(reportData);
  } else {
    // Para outros formatos, simular download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="report.${format}"`);
    res.send(JSON.stringify(reportData));
  }
});

// ============================================================================
// FISCAL ROUTES
// ============================================================================

app.get('/api/fiscal/validate-company', (req, res) => {
  res.json({
    isValid: true,
    companyData: {
      cnpj: '12.345.678/0001-90',
      name: 'Empresa Demo',
      status: 'ATIVA',
    },
  });
});

app.get('/api/fiscal', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  res.json({
    data: [],
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: 0,
      totalPages: 0,
    },
  });
});

app.get('/api/fiscal/stats', (req, res) => {
  res.json({
    totalDocuments: 0,
    totalNFe: 0,
    totalNFSe: 0,
    totalNFCe: 0,
  });
});

// ============================================================================
// COMPANY ROUTES
// ============================================================================

app.get('/api/company/my-company', (req, res) => {
  res.json({
    id: '550e8400-e29b-41d4-a716-446655440007',
    name: 'Empresa Demo',
    cnpj: '12.345.678/0001-90',
    email: 'empresa@lojas.com',
    phone: '(11) 99999-9999',
    address: {
      street: 'Rua das Empresas',
      number: '123',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
});

app.get('/api/company/stats', (req, res) => {
  res.json({
    totalProducts: mockProducts.length,
    totalCustomers: mockCustomers.length,
    totalSales: mockSales.length,
    totalRevenue: mockSales.reduce((sum, s) => sum + s.total, 0),
  });
});

app.get('/api/company', (req, res) => {
  res.json({
    data: [{
      id: '550e8400-e29b-41d4-a716-446655440007',
      name: 'Empresa Demo',
      cnpj: '12.345.678/0001-90',
      isActive: true,
    }],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    },
  });
});

// ============================================================================
// ADMIN ROUTES
// ============================================================================

app.get('/api/admin', (req, res) => {
  res.json({
    data: [mockUsers.admin],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    },
  });
});

// ============================================================================
// DASHBOARD ROUTES
// ============================================================================

app.get('/api/dashboard/metrics', (req, res) => {
  res.json({
    totalSales: mockSales.length,
    totalRevenue: mockSales.reduce((sum, s) => sum + s.total, 0),
    totalProducts: mockProducts.length,
    totalCustomers: mockCustomers.length,
    lowStockProducts: mockProducts.filter(p => p.stockQuantity <= p.minStockQuantity).length,
    upcomingBills: mockBills.filter(b => !b.isPaid).length,
    salesByPeriod: [
      { date: '2024-01-01', total: 5000 },
      { date: '2024-01-02', total: 6500 },
      { date: '2024-01-03', total: 4800 },
    ],
    topProducts: mockProducts.map(p => ({
      product: p,
      quantity: Math.floor(Math.random() * 50),
      revenue: Math.floor(Math.random() * 1000),
    })),
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 Mock API Server rodando na porta ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}/api`);
  console.log(`🧪 Pronto para testes!`);
});

module.exports = app;

/**
 * API Endpoints - Documentação completa dos endpoints disponíveis
 * Baseado na documentação oficial da API
 */

import { api } from './apiClient';

// ============================================================================
// AUTH
// ============================================================================

export const authApi = {
  /**
   * POST /auth/login
   * Public - Login do usuário
   * Body: { login: string, password: string }
   * @returns { access_token, user } + seta cookie httpOnly refresh_token
   */
  login: (login: string, password: string) =>
    api.post('/auth/login', { login, password }),

  /**
   * POST /auth/refresh
   * Public (lê cookie httpOnly) - Renovar access token
   * Body: Vazio
   * @returns { access_token, user } (rotação de refresh token)
   */
  refresh: () => api.post('/auth/refresh'),

  /**
   * POST /auth/logout
   * Auth via cookie - Logout
   * Body: Vazio
   * @returns { message: 'Logged out' }
   */
  logout: () => api.post('/auth/logout'),
};

// ============================================================================
// PRODUCT
// ============================================================================

export const productApi = {
  /**
   * POST /product
   * Roles: COMPANY - Criar produto (sem fotos)
   * Body: { name, photos, barcode, size, stockQuantity, price, category, expirationDate }
   */
  create: (data: any) => api.post('/product', data),

  /**
   * POST /product/upload-and-create
   * Roles: COMPANY - Criar produto com upload de fotos
   * Content-Type: multipart/form-data
   * Body: Arquivos de imagem + dados do produto
   */
  createWithPhotos: (formData: FormData) => api.post('/product/upload-and-create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  /**
   * GET /product
   * Roles: ADMIN, COMPANY, SELLER - Lista paginada
   * Query: page, limit, search
   */
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/product', { params }),

  /**
   * GET /product/stats
   * Roles: ADMIN, COMPANY - Estatísticas
   */
  stats: () => api.get('/product/stats'),

  /**
   * GET /product/low-stock
   * Roles: ADMIN, COMPANY
   * Query: threshold
   */
  lowStock: (threshold?: number) =>
    api.get('/product/low-stock', { params: { threshold } }),

  /**
   * GET /product/expiring
   * Roles: ADMIN, COMPANY
   * Query: days
   */
  expiring: (days?: number) =>
    api.get('/product/expiring', { params: { days } }),

  /**
   * GET /product/categories
   * Roles: ADMIN, COMPANY, SELLER - Retorna categorias distintas
   */
  categories: () => api.get('/product/categories'),

  /**
   * GET /product/barcode/:barcode
   * Roles: ADMIN, COMPANY, SELLER - Buscar por código de barras
   */
  byBarcode: (barcode: string) => api.get(`/product/barcode/${barcode}`),

  /**
   * GET /product/:id
   * Roles: ADMIN, COMPANY, SELLER
   */
  get: (id: string) => api.get(`/product/${id}`),

  /**
   * PATCH /product/:id
   * Roles: ADMIN, COMPANY - Atualizar produto
   * Body: Mesma estrutura do POST (campos opcionais)
   */
  update: (id: string, data: any) => api.patch(`/product/${id}`, data),

  /**
   * PATCH /product/:id/upload-and-update
   * Roles: COMPANY - Atualizar produto com upload de fotos
   * Content-Type: multipart/form-data
   * Body: Arquivos de imagem + dados do produto + photosToDelete (opcional)
   */
  updateWithPhotos: (id: string, formData: FormData) => api.patch(`/product/${id}/upload-and-update`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  /**
   * PATCH /product/:id/stock
   * Roles: ADMIN, COMPANY - Atualizar estoque
   * Body: { stockQuantity }
   */
  updateStock: (id: string, data: any) =>
    api.patch(`/product/${id}/stock`, data),

  /**
   * DELETE /product/:id
   * Roles: ADMIN, COMPANY
   */
  delete: (id: string, params?: any) => api.delete(`/product/${id}`, { params }),
};

// ============================================================================
// COMPANY
// ============================================================================

export const companyApi = {
  /**
   * POST /company
   * Roles: ADMIN - Criar empresa
   * Body: { name, login, password, phone, cnpj, stateRegistration, municipalRegistration, email, zipCode, state, city, district, street, number, complement, fiscalEmail, fiscalPhone }
   */
  create: (data: any) => api.post('/company', data),

  /**
   * GET /company
   * Roles: ADMIN, COMPANY - Lista empresas
   */
  list: () => api.get('/company'),

  /**
   * GET /company/my-company
   * Roles: COMPANY, SELLER - Dados da própria empresa
   */
  myCompany: () => api.get('/company/my-company'),

  /**
   * GET /company/stats
   * Roles: COMPANY - Estatísticas da empresa
   */
  stats: () => api.get('/company/stats'),

  /**
   * GET /company/:id
   * Roles: ADMIN
   */
  get: (id: string) => api.get(`/company/${id}`),

  /**
   * PATCH /company/my-company
   * Roles: COMPANY - Atualiza dados da própria empresa
   * Body: Mesma estrutura do POST (campos opcionais)
   */
  updateMyCompany: (data: any) => api.patch('/company/my-company', data),

  /**
   * PATCH /company/:id
   * Roles: ADMIN
   * Body: Mesma estrutura do POST (campos opcionais)
   */
  update: (id: string, data: any) => api.patch(`/company/${id}`, data),

  /**
   * DELETE /company/:id
   * Roles: ADMIN
   */
  delete: (id: string, config?: any) => api.delete(`/company/${id}`, config),

  /**
   * PATCH /company/:id/activate
   * Roles: ADMIN - Ativar empresa
   */
  activate: (id: string) => api.patch(`/company/${id}/activate`),

  /**
   * PATCH /company/:id/deactivate
   * Roles: ADMIN - Desativar empresa
   */
  deactivate: (id: string) => api.patch(`/company/${id}/deactivate`),

  /**
   * POST /company/my-company/upload-logo
   * Roles: COMPANY - Upload do logo da empresa
   * Body: FormData com campo 'logo'
   */
  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post('/company/my-company/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * DELETE /company/my-company/logo
   * Roles: COMPANY - Remover logo da empresa
   */
  removeLogo: () => api.delete('/company/my-company/logo'),

  /**
   * GET /company/my-company/fiscal-config
   * Roles: COMPANY - Obter configurações fiscais
   */
  getFiscalConfig: () => api.get('/company/my-company/fiscal-config'),

  /**
   * GET /company/my-company/fiscal-config/valid
   * Roles: COMPANY - Verificar se tem configuração fiscal válida para NFCe
   */
  hasValidFiscalConfig: () => api.get('/company/my-company/fiscal-config/valid'),
};

// ============================================================================
// SELLER
// ============================================================================

export const sellerApi = {
  /**
   * POST /seller
   * Roles: COMPANY - Criar vendedor
   * Body: { login, password, name, phone, email }
   */
  create: (data: any) => api.post('/seller', data),

  /**
   * GET /seller
   * Roles: ADMIN, COMPANY - Lista vendedores
   * Query: search, page, limit, companyId
   */
  list: (params?: { search?: string; page?: number; limit?: number; companyId?: string }) =>
    api.get('/seller', { params }),

  /**
   * GET /seller/my-profile
   * Roles: SELLER - Perfil do vendedor logado
   */
  myProfile: () => api.get('/seller/my-profile'),

  /**
   * GET /seller/my-stats
   * Roles: SELLER
   */
  myStats: () => api.get('/seller/my-stats'),

  /**
   * GET /seller/my-sales
   * Roles: SELLER
   * Query: page, limit
   */
  mySales: (params?: { page?: number; limit?: number }) =>
    api.get('/seller/my-sales', { params }),

  /**
   * GET /seller/:id
   * Roles: ADMIN, COMPANY
   */
  get: (id: string) => api.get(`/seller/${id}`),

  /**
   * GET /seller/:id/stats
   * Roles: ADMIN, COMPANY
   */
  stats: (id: string) => api.get(`/seller/${id}/stats`),

  /**
   * GET /seller/:id/sales
   * Roles: ADMIN, COMPANY
   * Query: page, limit
   */
  sales: (id: string, params?: { page?: number; limit?: number }) =>
    api.get(`/seller/${id}/sales`, { params }),

  /**
   * PATCH /seller/my-profile
   * Roles: SELLER
   * Body: Mesma estrutura do POST (campos opcionais)
   */
  updateMyProfile: (data: any) => api.patch('/seller/my-profile', data),

  /**
   * PATCH /seller/:id
   * Roles: ADMIN, COMPANY
   * Body: Mesma estrutura do POST (campos opcionais)
   */
  update: (id: string, data: any) => api.patch(`/seller/${id}`, data),

  /**
   * DELETE /seller/:id
   * Roles: ADMIN, COMPANY
   */
  delete: (id: string, params?: any) => api.delete(`/seller/${id}`, { params }),
};

// ============================================================================
// SALE
// ============================================================================

export const saleApi = {
  /**
   * POST /sale
   * Roles: COMPANY, SELLER - Criar venda
   * Body: { sellerId, items: [{ productId, quantity, unitPrice, totalPrice }], clientCpfCnpj, clientName, paymentMethods: [{ method, amount }], totalPaid }
   */
  create: (data: any) => api.post('/sale', data),

  /**
   * GET /sale
   * Roles: ADMIN, COMPANY, SELLER
   * Query: page, limit, sellerId, startDate, endDate
   */
  list: (params?: {
    page?: number;
    limit?: number;
    sellerId?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get('/sale', { params }),

  /**
   * GET /sale/stats
   * Roles: ADMIN, COMPANY
   */
  stats: () => api.get('/sale/stats'),

  /**
   * GET /sale/my-sales
   * Roles: SELLER
   */
  mySales: () => api.get('/sale/my-sales'),

  /**
   * GET /sale/my-stats
   * Roles: SELLER
   */
  myStats: () => api.get('/sale/my-stats'),

  /**
   * GET /sale/:id
   * Roles: ADMIN, COMPANY, SELLER
   */
  get: (id: string) => api.get(`/sale/${id}`),

  /**
   * POST /sale/exchange
   * Roles: COMPANY - Processar troca
   * Body: { originalSaleId, newItems: [{ productId, quantity, unitPrice, totalPrice }], reason }
   */
  exchange: (data: any) => api.post('/sale/exchange', data),

  /**
   * POST /sale/:id/reprint
   * Roles: ADMIN, COMPANY, SELLER - Reimprimir cupom da venda
   */
  reprint: (id: string) => api.post(`/sale/${id}/reprint`),

  /**
   * GET /sale/:id/print-content
   * Roles: ADMIN, COMPANY, SELLER - Obter conteúdo de impressão para venda
   */
  getPrintContent: (id: string) => api.get(`/sale/${id}/print-content`),

  /**
   * PATCH /sale/:id
   * Roles: ADMIN, COMPANY
   * Body: Mesma estrutura do POST (campos opcionais)
   */
  update: (id: string, data: any) => api.patch(`/sale/${id}`, data),

  /**
   * DELETE /sale/:id
   * Roles: ADMIN, COMPANY
   */
  delete: (id: string, data?: any) => api.delete(`/sale/${id}`, { data }),
};

// ============================================================================
// CUSTOMER
// ============================================================================

export const customerApi = {
  /**
   * POST /customer
   * Roles: COMPANY
   * Body: { name, phone, email, cpfCnpj, zipCode, state, city, district, street, number, complement }
   */
  create: (data: any) => api.post('/customer', data),

  /**
   * GET /customer
   * Roles: ADMIN, COMPANY, SELLER
   * Query: page, limit, search, companyId
   */
  list: (params?: { page?: number; limit?: number; search?: string; companyId?: string }) =>
    api.get('/customer', { params }),

  /**
   * GET /customer/stats
   * Roles: ADMIN, COMPANY
   */
  stats: () => api.get('/customer/stats'),

  /**
   * GET /customer/cpf-cnpj/:cpfCnpj
   * Roles: ADMIN, COMPANY, SELLER
   */
  byCpfCnpj: (cpfCnpj: string) => api.get(`/customer/cpf-cnpj/${cpfCnpj}`),

  /**
   * GET /customer/:id
   * Roles: ADMIN, COMPANY
   */
  get: (id: string) => api.get(`/customer/${id}`),

  /**
   * GET /customer/:id/installments
   * Roles: ADMIN, COMPANY
   */
  installments: (id: string) => api.get(`/customer/${id}/installments`),

  /**
   * PATCH /customer/:id
   * Roles: ADMIN, COMPANY
   * Body: Mesma estrutura do POST (campos opcionais)
   */
  update: (id: string, data: any) => api.patch(`/customer/${id}`, data),

  /**
   * DELETE /customer/:id
   * Roles: ADMIN, COMPANY
   */
  delete: (id: string, params?: any) => api.delete(`/customer/${id}`, { params }),

  /**
   * POST /customer/send-bulk-promotional-email
   * Roles: COMPANY - Enviar email promocional em massa para todos os clientes
   * Body: { subject, message }
   */
  sendBulkPromotionalEmail: (data: {
    title: string;
    message: string;
    description: string;
    discount: string;
    validUntil: string;
  }) => api.post('/customer/send-bulk-promotional-email', data),
};

// ============================================================================
// PRINTER
// ============================================================================

export const printerApi = {
  /**
   * POST /printer/discover
   * Roles: ADMIN, COMPANY - Descobrir impressoras
   */
  discover: () => api.post('/printer/discover'),

  /**
   * POST /printer
   * Roles: COMPANY - Adicionar impressora
   * Body: { name, type, connection, port, isDefault }
   */
  create: (data: any) => api.post('/printer', data),

  /**
   * GET /printer
   * Roles: ADMIN, COMPANY
   */
  list: () => api.get('/printer'),

  /**
   * GET /printer/available
   * Roles: ADMIN, COMPANY - Lista impressoras disponíveis no sistema
   */
  available: () => api.get('/printer/available'),

  /**
   * POST /printer/register-devices
   * Roles: ADMIN, COMPANY - Registra impressoras detectadas do computador do cliente
   */
  registerDevices: (data: { computerId: string; printers: any[] }) => api.post('/printer/register-devices', data),

  /**
   * GET /printer/check-drivers
   * Roles: ADMIN, COMPANY - Verifica drivers instalados
   */
  checkDrivers: () => api.get('/printer/check-drivers'),

  /**
   * POST /printer/install-drivers
   * Roles: ADMIN, COMPANY - Instala drivers automaticamente
   */
  installDrivers: () => api.post('/printer/install-drivers'),

  /**
   * GET /printer/:id/status
   * Roles: ADMIN, COMPANY
   */
  status: (id: string) => api.get(`/printer/${id}/status`),

  /**
   * POST /printer/:id/test
   * Roles: ADMIN, COMPANY
   */
  test: (id: string) => api.post(`/printer/${id}/test`),

  /**
   * POST /printer/:id/open-drawer
   * Roles: COMPANY - Abre gaveta de dinheiro
   */
  openDrawer: (id: string) => api.post(`/printer/${id}/open-drawer`),

  /**
   * GET /printer/:id/queue
   * Roles: ADMIN, COMPANY - Obtém fila de impressão
   */
  queue: (id: string) => api.get(`/printer/${id}/queue`),

  /**
   * GET /printer/:id/logs
   * Roles: ADMIN, COMPANY - Obtém logs recentes da impressora
   */
  logs: (id: string) => api.get(`/printer/${id}/logs`),

  /**
   * POST /printer/custom-footer
   * Roles: COMPANY - Atualiza footer personalizado
   */
  updateFooter: (data: { customFooter: string }) => api.post('/printer/custom-footer', data),

  /**
   * GET /printer/custom-footer
   * Roles: COMPANY - Obtém footer personalizado
   */
  getFooter: () => api.get('/printer/custom-footer'),

  /**
   * DELETE /printer/:id
   * Roles: ADMIN, COMPANY - Excluir impressora
   */
  delete: (id: string) => api.delete(`/printer/${id}`),
};

// ============================================================================
// SCALE
// ============================================================================

export const scaleApi = {
  /**
   * GET /scale/available
   * Roles: ADMIN, COMPANY - Lista balanças disponíveis no sistema
   */
  available: () => api.get('/scale/available'),

  /**
   * POST /scale/register-devices
   * Roles: ADMIN, COMPANY - Registra balanças detectadas do computador do cliente
   */
  registerDevices: (data: { computerId: string; scales: any[] }) => api.post('/scale/register-devices', data),

  /**
   * POST /scale/discover
   * Roles: ADMIN, COMPANY - Descobrir balanças
   */
  discover: () => api.post('/scale/discover'),

  /**
   * GET /scale
   * Roles: ADMIN, COMPANY
   */
  list: () => api.get('/scale'),

  /**
   * POST /scale
   * Roles: COMPANY - Adicionar balança
   * Body: { name, connectionInfo }
   */
  create: (data: { name: string; connectionInfo: string }) => api.post('/scale', data),

  /**
   * GET /scale/check-drivers
   * Roles: ADMIN, COMPANY - Verifica drivers
   */
  checkDrivers: () => api.get('/scale/check-drivers'),

  /**
   * POST /scale/install-drivers
   * Roles: ADMIN, COMPANY - Instala drivers automaticamente
   */
  installDrivers: () => api.post('/scale/install-drivers'),

  /**
   * GET /scale/:id/status
   */
  status: (id: string) => api.get(`/scale/${id}/status`),

  /**
   * POST /scale/:id/test
   */
  test: (id: string) => api.post(`/scale/${id}/test`),
};

// ============================================================================
// FISCAL
// ============================================================================

export const fiscalApi = {
  /**
   * POST /fiscal/nfe
   * Roles: COMPANY - Gerar NFe
   * Body: { clientCpfCnpj, clientName, items: [{ productId, quantity, unitPrice, totalPrice }], totalValue, paymentMethod }
   */
  generateNFe: (data: any) => api.post('/fiscal/nfe', data),

  /**
   * POST /fiscal/upload-xml
   * Roles: COMPANY - Upload de arquivo XML de nota fiscal de entrada
   * Content-Type: multipart/form-data
   * Body: xmlFile (arquivo XML)
   * Validações: 
   * - Tipos: application/xml, text/xml
   * - Tamanho máximo: 10MB
   * - Formatos: NFe, NFSe, NFCe
   */
  uploadXml: (file: File, documentType: string = 'inbound') => {
    const formData = new FormData();
    formData.append('xmlFile', file);
    return api.post('/fiscal/upload-xml', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * GET /fiscal
   * Roles: ADMIN, COMPANY
   * Query: page, limit, documentType
   */
  list: (params?: {
    page?: number;
    limit?: number;
    documentType?: string;
  }) => api.get('/fiscal', { params }),

  /**
   * GET /fiscal/stats
   * Roles: ADMIN, COMPANY
   */
  stats: () => api.get('/fiscal/stats'),

  /**
   * GET /fiscal/validate-company
   * Roles: COMPANY
   */
  validateCompany: () => api.get('/fiscal/validate-company'),

  /**
   * GET /fiscal/access-key/:accessKey
   * Roles: ADMIN, COMPANY
   */
  byAccessKey: (accessKey: string) => api.get(`/fiscal/access-key/${accessKey}`),

  /**
   * GET /fiscal/:id
   * Roles: ADMIN, COMPANY
   */
  get: (id: string) => api.get(`/fiscal/${id}`),

  /**
   * GET /fiscal/:id/download?format=xml|pdf
   * Roles: ADMIN, COMPANY - Baixa documento
   */
  download: (id: string, format: 'xml' | 'pdf') =>
    api.get(`/fiscal/${id}/download`, {
      params: { format },
      responseType: 'blob',
    }),

  /**
   * POST /fiscal/:id/cancel
   * Roles: COMPANY - Cancelar documento
   * Body: { reason }
   */
  cancel: (id: string, data: any) => api.post(`/fiscal/${id}/cancel`, data),
};

// ============================================================================
// CASH CLOSURE
// ============================================================================

export const cashClosureApi = {
  /**
   * POST /cash-closure
   * Roles: COMPANY - Abrir novo fechamento
   * Body: { openingAmount }
   */
  create: (data: any) => api.post('/cash-closure', data),

  /**
   * GET /cash-closure
   * Roles: ADMIN, COMPANY
   * Query: page, limit, isClosed
   */
  list: (params?: { page?: number; limit?: number; isClosed?: boolean }) =>
    api.get('/cash-closure', { params }),

  /**
   * GET /cash-closure/current
   * Roles: COMPANY - Fechamento atual
   */
  current: () => api.get('/cash-closure/current'),

  /**
   * GET /cash-closure/stats
   * Roles: COMPANY
   */
  stats: () => api.get('/cash-closure/stats'),

  /**
   * GET /cash-closure/history
   * Roles: COMPANY - Paginação
   */
  history: (params?: { page?: number; limit?: number }) =>
    api.get('/cash-closure/history', { params }),

  /**
   * GET /cash-closure/:id
   * Roles: ADMIN, COMPANY
   */
  get: (id: string) => api.get(`/cash-closure/${id}`),

  /**
   * PATCH /cash-closure/close
   * Roles: COMPANY - Fechar caixa atual
   * Body: { closingAmount, notes }
   */
  close: (data: any) => api.patch('/cash-closure/close', data),

  /**
   * POST /cash-closure/:id/reprint
   * Roles: ADMIN, COMPANY - Reimprimir relatório
   */
  reprint: (id: string) => api.post(`/cash-closure/${id}/reprint`),
};

// ============================================================================
// BILL TO PAY
// ============================================================================

export const billToPayApi = {
  /**
   * POST /bill-to-pay
   * Roles: COMPANY - Criar conta a pagar
   * Body: { title, barcode, paymentInfo, dueDate, amount }
   */
  create: (data: any) => api.post('/bill-to-pay', data),

  /**
   * GET /bill-to-pay
   * Roles: ADMIN, COMPANY
   * Query: page, limit, isPaid, dates
   */
  list: (params?: {
    page?: number;
    limit?: number;
    isPaid?: boolean;
    startDate?: string;
    endDate?: string;
  }) => api.get('/bill-to-pay', { params }),

  /**
   * GET /bill-to-pay/stats
   * Roles: ADMIN, COMPANY
   */
  stats: () => api.get('/bill-to-pay/stats'),

  /**
   * GET /bill-to-pay/overdue
   * Roles: ADMIN, COMPANY
   */
  overdue: () => api.get('/bill-to-pay/overdue'),

  /**
   * GET /bill-to-pay/upcoming?days=
   * Roles: ADMIN, COMPANY
   */
  upcoming: (days?: number) =>
    api.get('/bill-to-pay/upcoming', { params: { days } }),

  /**
   * GET /bill-to-pay/:id
   * Roles: ADMIN, COMPANY
   */
  get: (id: string) => api.get(`/bill-to-pay/${id}`),

  /**
   * PATCH /bill-to-pay/:id
   * Roles: ADMIN, COMPANY
   * Body: Mesma estrutura do POST (campos opcionais)
   */
  update: (id: string, data: any) => api.patch(`/bill-to-pay/${id}`, data),

  /**
   * PATCH /bill-to-pay/:id/mark-paid
   * Roles: ADMIN, COMPANY
   * Body: { paidDate, paidAmount, notes }
   */
  markPaid: (id: string) => api.patch(`/bill-to-pay/${id}/mark-paid`),

  /**
   * DELETE /bill-to-pay/:id
   * Roles: ADMIN, COMPANY
   */
  delete: (id: string, data?: any) => api.delete(`/bill-to-pay/${id}`, { data }),
};

// ============================================================================
// UPLOAD
// ============================================================================

export const uploadApi = {
  /**
   * POST /upload/single
   * Roles: ADMIN, COMPANY
   * multipart/form-data (file) - retorna URL
   * Body: Arquivo + subfolder (opcional)
   */
  single: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * POST /upload/multiple
   * Roles: ADMIN, COMPANY
   * multipart/form-data (files[])
   * Body: Múltiplos arquivos + subfolder (opcional)
   */
  multiple: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * DELETE /upload/file
   * Roles: ADMIN, COMPANY
   * Body: { fileUrl }
   */
  deleteFile: (fileUrl: string) =>
    api.delete('/upload/file', { data: { fileUrl } }),

  /**
   * DELETE /upload/files
   * Roles: ADMIN, COMPANY
   * Body: { fileUrls: string[] }
   */
  deleteFiles: (fileUrls: string[]) =>
    api.delete('/upload/files', { data: { fileUrls } }),

  /**
   * POST /upload/info
   * Roles: ADMIN, COMPANY
   * Body: { fileUrl }
   */
  info: (fileUrl: string) => api.post('/upload/info', { fileUrl }),

  /**
   * POST /upload/resize
   * Roles: ADMIN, COMPANY
   * multipart file + query maxWidth/maxHeight
   */
  resize: (file: File, maxWidth?: number, maxHeight?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/resize', formData, {
      params: { maxWidth, maxHeight },
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * POST /upload/optimize
   * Roles: ADMIN, COMPANY
   * multipart file
   */
  optimize: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/optimize', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ============================================================================
// REPORTS
// ============================================================================

export const reportsApi = {
  /**
   * POST /reports/generate
   * Roles: COMPANY
   * Gera relatório (JSON/XML/XLSX) e retorna arquivo
   * Content-Disposition: attachment
   * Body: { reportType, format, startDate, endDate, includeProducts, includeCustomers, includeFiscal }
   * Formatos disponíveis: json, xml, excel
   * Tipos de relatório: sales, products, customers, fiscal, complete
   */
  generate: (data: any) =>
    api.post('/reports/generate', data, {
      responseType: 'blob',
    }),
};

// ============================================================================
// N8N
// ============================================================================

export const n8nApi = {
  /**
   * POST /n8n/test
   * Roles: ADMIN, COMPANY
   */
  test: (data: any) => api.post('/n8n/test', data),

  /**
   * GET /n8n/status
   * Roles: ADMIN, COMPANY
   */
  status: () => api.get('/n8n/status'),

  /**
   * GET /n8n/webhook-url
   * Roles: ADMIN, COMPANY
   */
  webhookUrl: () => api.get('/n8n/webhook-url'),
};

// ============================================================================
// WHATSAPP
// ============================================================================

export const whatsappApi = {
  /**
   * POST /whatsapp/send-message
   * Roles: ADMIN, COMPANY
   * Body: { to, message, type, mediaUrl, filename }
   */
  sendMessage: (data: any) => api.post('/whatsapp/send-message', data),

  /**
   * POST /whatsapp/send-template
   * Roles: ADMIN, COMPANY
   * Body: { to, templateName, language, parameters }
   */
  sendTemplate: (data: any) => api.post('/whatsapp/send-template', data),

  /**
   * POST /whatsapp/validate-phone
   * Roles: ADMIN, COMPANY
   * Body: { phone }
   */
  validatePhone: (phone: string) =>
    api.post('/whatsapp/validate-phone', { phone }),

  /**
   * POST /whatsapp/format-phone
   * Roles: ADMIN, COMPANY
   * Body: { phone }
   */
  formatPhone: (phone: string) =>
    api.post('/whatsapp/format-phone', { phone }),
};

// ============================================================================
// DASHBOARD
// ============================================================================

export const dashboardApi = {
  /**
   * GET /dashboard/metrics
   * Roles: ADMIN, COMPANY, SELLER
   */
  metrics: () => api.get('/dashboard/metrics'),
};

// ============================================================================
// ADMIN
// ============================================================================

export const adminApi = {
  /**
   * POST /admin
   * Roles: ADMIN - Criar conta de administrador
   * Body: { login, password, name }
   */
  create: (data: any) => api.post('/admin', data),

  /**
   * GET /admin
   * Roles: ADMIN - Lista administradores
   * Query: page, limit
   */
  list: () => api.get('/admin'),

  /**
   * GET /admin/:id
   * Roles: ADMIN
   */
  get: (id: string) => api.get(`/admin/${id}`),

  /**
   * PATCH /admin/:id
   * Roles: ADMIN
   * Body: Mesma estrutura do POST (campos opcionais)
   */
  update: (id: string, data: any) => api.patch(`/admin/${id}`, data),

  /**
   * DELETE /admin/:id
   * Roles: ADMIN
   */
  delete: (id: string) => api.delete(`/admin/${id}`),
};

/**
 * API Endpoints - Documentação completa dos endpoints disponíveis
 * Baseado na documentação oficial da API
 */

import { api } from './apiClient';
import type { DataPeriodFilter, NfceEmitida } from '@/types';

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

  /**
   * POST /auth/company/:companyId/change-password
   * Roles: ADMIN, MANAGER - Alterar senha de login de uma empresa (gestor só nas suas empresas)
   * Body: { newPassword: string }
   * @returns { message: string }
   */
  changeCompanyPassword: (companyId: string, newPassword: string) =>
    api.post(`/auth/company/${companyId}/change-password`, { newPassword }),
};

// ============================================================================
// NCM (Nomenclatura Comum do Mercosul - proxy Receita Federal)
// ============================================================================

export const ncmApi = {
  /** GET /ncm - Lista códigos NCM (proxy da API Receita Federal, evita CORS) */
  list: () => api.get('/ncm'),
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
   * Roles: ADMIN, COMPANY, SELLER, MANAGER - Lista paginada
   * Query: page, limit, search, companyId (obrigatório para gestor)
   */
  list: (params?: { page?: number; limit?: number; search?: string; companyId?: string }) =>
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
   * PATCH /company/my-company/data-period
   * Roles: COMPANY - Atualiza o período padrão dos dados
   */
  updateDataPeriod: (dataPeriod: DataPeriodFilter) =>
    api.patch('/company/my-company/data-period', { dataPeriod }),

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
   * PATCH /company/my-company/fiscal-config
   * Roles: COMPANY - Atualizar configurações fiscais
   */
  updateFiscalConfig: (data: any) => api.patch('/company/my-company/fiscal-config', data),

  /**
   * POST /company/my-company/upload-certificate
   * Roles: COMPANY - Upload do certificado digital para consulta SEFAZ (notas de entrada)
   */
  uploadCertificate: (file: File) => {
    const formData = new FormData();
    formData.append('certificate', file);
    return api.post('/company/my-company/upload-certificate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * GET /company/my-company/fiscal-config/valid
   * Roles: COMPANY - Verificar se tem configuração fiscal válida para NFCe
   */
  hasValidFiscalConfig: () => api.get('/company/my-company/fiscal-config/valid'),

  /**
   * GET /company/:id/fiscal-config
   * Roles: ADMIN - Obter configurações fiscais completas da empresa (sem mascaramento)
   */
  getFiscalConfigForAdmin: (id: string) => api.get(`/company/${id}/fiscal-config`),

  /**
   * PATCH /company/:id/fiscal-config
   * Roles: ADMIN - Atualizar configurações fiscais da empresa (FocusNFE + SEFAZ + IBPT)
   */
  updateFiscalConfigForAdmin: (id: string, data: any) =>
    api.patch(`/company/${id}/fiscal-config`, data),

  /**
   * GET /admin/focus-nfe-config
   * Como o token FocusNFE é global no Admin, esse endpoint delega para
   * a rota admin. O `_id` é ignorado e mantido por compatibilidade de assinatura.
   */
  getFocusNfeConfigForAdmin: (_id?: string) => api.get('/admin/nfeio-config'),

  /**
   * PATCH /admin/nfeio-config
   * Atualiza o token e ambiente FocusNFE globais.
   */
  updateFocusNfeConfigForAdmin: (_id: string, data: any) =>
    api.patch('/admin/nfeio-config', {
      ...(data.focusNfeApiKey !== undefined && { nfeioApiKey: data.focusNfeApiKey }),
      ...(data.focusNfeEnvironment !== undefined && { nfeioEnvironment: data.focusNfeEnvironment }),
      ...(data.ibptToken !== undefined && { ibptToken: data.ibptToken }),
    }),
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
  myProfile: {
    get: () => api.get('/seller/my-profile'),
    update: (data: any) => api.patch('/seller/my-profile', data),
  },

  /**
   * GET /seller/my-stats
   * Roles: SELLER
   */
  myStats: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/seller/my-stats', { params }),

  /**
   * GET /seller/my-sales
   * Roles: SELLER
   * Query: page, limit
   */
  mySales: (params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) =>
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
   * PATCH /seller/my-data-period
   * Roles: SELLER - Atualiza período padrão dos dados
   */
  updateMyDataPeriod: (dataPeriod: DataPeriodFilter) =>
    api.patch('/seller/my-data-period', { dataPeriod }),

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
// SELLER SCHEDULE (Jornada individual do vendedor)
// ============================================================================

export const sellerScheduleApi = {
  /**
   * GET /seller/:sellerId/schedule
   * Roles: COMPANY, ADMIN, MANAGER - Obter jornada configurada
   */
  get: (sellerId: string) => api.get(`/seller/${sellerId}/schedule`),

  /**
   * PUT /seller/:sellerId/schedule
   * Roles: COMPANY, ADMIN - Criar/atualizar jornada individual
   */
  upsert: (sellerId: string, data: any) =>
    api.put(`/seller/${sellerId}/schedule`, data),

  /**
   * DELETE /seller/:sellerId/schedule
   * Roles: COMPANY, ADMIN - Remover (volta a usar a jornada da empresa)
   */
  remove: (sellerId: string) => api.delete(`/seller/${sellerId}/schedule`),
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
   * Body: {
   *   originalSaleId,
   *   reason,
   *   returnedItems: [{ saleItemId, productId, quantity }],
   *   newItems?: [{ productId, quantity, unitPrice? }],
   *   payments?: [{ method, amount, additionalInfo? }],
   *   refunds?: [{ method, amount, additionalInfo? }],
   *   issueStoreCredit?: boolean
   * }
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

  /**
   * POST /sale/:id/cancel
   * Roles: ADMIN, COMPANY - Cancelar venda
   * Body: { reason: string }
   */
  cancel: (id: string, data: { reason: string }) => api.post(`/sale/${id}/cancel`, data),
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
// PRINTER - Removido: Configurações de impressoras removidas do sistema
// ============================================================================

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
// BOLETO (Billet) — Unimake e-Boleto
// ============================================================================

/**
 * Resposta de configuração Unimake de uma empresa.
 * `configured: true` indica que `appId` + `appKey` já foram cadastrados.
 * O `appKey` NUNCA é exposto em GET — apenas o status `configured`.
 */
export interface UnimakeCompanyConfig {
  appId: string;
  configurationId: string;
  sandbox: boolean;
  configured: boolean;
}

/**
 * Linha da tabela de overview (Admin) — empresas × Unimake.
 */
export interface UnimakeCompanyOverviewRow {
  id: string;
  name: string;
  cnpj?: string | null;
  unimakeConfigured: boolean;
  unimakeSandbox: boolean;
  hasCertificateA1: boolean;
  boletoAllowed: boolean;
  boletoEnabled: boolean;
}

export const billetApi = {
  list: (params?: { page?: number; limit?: number; status?: string; customerId?: string; startDate?: string; endDate?: string }) =>
    api.get('/billet', { params }),
  get: (id: string) => api.get(`/billet/${id}`),
  getPdf: (id: string) => api.get(`/billet/${id}/pdf`, { responseType: 'arraybuffer' }),
  cancel: (id: string) => api.post(`/billet/${id}/cancel`),
  markAsPaid: (id: string) => api.post(`/billet/${id}/mark-paid`),
  sendWhatsApp: (id: string) => api.post(`/billet/${id}/send-whatsapp`),
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
   * POST /fiscal/nfce
   * Roles: COMPANY - Emitir NFC-e dedicada (modelo 65).
   * Implementação ATO DIAT 38/2020 — Art. 8º: a NFC-e autorizada
   * retorna dados estruturados (chave, protocolo, QR Code, etc.)
   * que devem ser exibidos ao consumidor para garantir a idoneidade
   * do documento em contingência.
   */
  emitirNfce: (data: {
    saleId: string;
    sellerName: string;
    clientCpfCnpj?: string;
    clientName?: string;
    clientEmail?: string;
    clientIndIEDest?: 1 | 2 | 9;
    clientIe?: string;
    clientAddress?: {
      zipCode?: string;
      street?: string;
      number?: string;
      district?: string;
      city?: string;
      state?: string;
      complement?: string;
      phone?: string;
    };
    items: Array<{
      productId: string;
      productName: string;
      barcode: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      discount?: number;
    }>;
    totalValue: number;
    valorDesconto?: number;
    troco?: number;
    payments: Array<{
      method: string;
      amount: number;
      cardIntegrationType?: string;
      acquirerCnpj?: string;
      cardBrand?: string;
      cardOperationType?: string;
      installmentCount?: number;
      installmentNumber?: number;
      authorizationCode?: string;
      terminalId?: string;
    }>;
    additionalInfo?: string;
    operationNature?: string;
    emissionPurpose?: number;
    referenceAccessKey?: string;
    pdvCode?: string;
    establishmentId?: string;
    indFinal?: 0 | 1;
    indicadorPresenca?: 1 | 2 | 3 | 4 | 9;
    intermediador?: { cnpj: string; idCadIntTran: string };
  }) => api.post<NfceEmitida>('/fiscal/nfce', data),

  /**
   * POST /fiscal/nfe-devolucao
   * Roles: COMPANY - Emitir NFe de devolução a partir de nota fiscal de entrada
   * Body: { inboundDocumentId: string }
   */
  generateReturnNFe: (inboundDocumentId: string) =>
    api.post('/fiscal/nfe-devolucao', { inboundDocumentId }),

  /**
   * GET /fiscal/inbound-invoice/:id/return-preview
   * Roles: COMPANY - Preview dos dados para NFe de devolução (sem emitir)
   */
  getInboundReturnPreview: (inboundDocumentId: string) =>
    api.get(`/fiscal/inbound-invoice/${inboundDocumentId}/return-preview`),

  /**
   * GET /fiscal/inbound-invoice/:id/returns
   * Roles: COMPANY - Listar NFe de devolução já emitidas para uma nota de entrada
   */
  getInboundReturns: (inboundDocumentId: string) =>
    api.get(`/fiscal/inbound-invoice/${inboundDocumentId}/returns`),

  /**
   * POST /fiscal/parse-inbound-xml
   * Roles: COMPANY - Parsear XML de NFe de entrada (somente leitura)
   * Body: { xml: string }
   * Retorna: { form, items, duplicatas }
   */
  parseInboundXml: (xml: string) => api.post('/fiscal/parse-inbound-xml', { xml }),

  /**
   * POST /fiscal/inbound-nfe/xml-from-access-key
   * Busca XML na SEFAZ (Distribuição DF-e / consChNFe) com o certificado da empresa.
   */
  fetchInboundXmlByAccessKey: (accessKeyOrBarcode: string) =>
    api.post<{ xml: string }>('/fiscal/inbound-nfe/xml-from-access-key', {
      accessKey: accessKeyOrBarcode,
    }),

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
   * Query: page, limit, documentType, startDate, endDate
   */
  list: (params?: {
    page?: number;
    limit?: number;
    documentType?: string;
    startDate?: string;
    endDate?: string;
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
   * GET /fiscal/:id/download-info
   * Roles: ADMIN, COMPANY - Metadados de formatos disponíveis
   */
  downloadInfo: (id: string) => api.get(`/fiscal/${id}/download-info`),

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
   * POST /fiscal/:id/link-focus-ref
   * Vincula a ref FocusNFE e sincroniza XML/DANFE
   */
  linkFocusRef: (id: string, focusRef: string) =>
    api.post(`/fiscal/${id}/link-focus-ref`, { focusRef }),

  /**
   * POST /fiscal/:id/send-email
   * Roles: ADMIN, COMPANY, SELLER - Enviar DANFE/XML por e-mail
   */
  sendEmail: (
    id: string,
    data: { email: string; format?: 'pdf' | 'xml' | 'both'; recipientName?: string },
  ) => api.post(`/fiscal/${id}/send-email`, data),

  /**
   * POST /fiscal/:id/cancel
   * Roles: COMPANY - Cancelar documento
   * Body: { reason } (mín. 15 caracteres - exigência SEFAZ)
   */
  cancel: (id: string, data: { reason: string }) => api.post(`/fiscal/${id}/cancel`, data),

  /**
   * POST /fiscal/inutilizacao
   * Roles: COMPANY - Inutilizar numeração NF-e ou NFC-e
   * Body: { serie, numeroInicial, numeroFinal, justificativa (mín. 15), modelo: '55'|'65' }
   */
  inutilizarNumeracao: (data: {
    serie: string;
    numeroInicial: number;
    numeroFinal: number;
    justificativa: string;
    modelo: '55' | '65';
  }) => api.post('/fiscal/inutilizacao', data),

  /**
   * POST /fiscal/:id/carta-correcao
   * Roles: COMPANY - Enviar Carta de Correção Eletrônica (CC-e) para NF-e autorizada
   * Body: { correcao } (mín. 15, máx. 1000 caracteres)
   */
  enviarCartaCorrecao: (id: string, data: { correcao: string }) =>
    api.post(`/fiscal/${id}/carta-correcao`, data),

  /**
   * POST /fiscal/contingencia/ativar
   * Roles: COMPANY - Ativar modo contingência NFC-e
   * Body: { motivo? }
   */
  ativarContingencia: (data?: { motivo?: string }) =>
    api.post('/fiscal/contingencia/ativar', data ?? {}),

  /**
   * POST /fiscal/contingencia/desativar
   * Roles: COMPANY - Desativar modo contingência NFC-e
   */
  desativarContingencia: () => api.post('/fiscal/contingencia/desativar'),

  /**
   * GET /fiscal/contingencia/status
   * Roles: COMPANY - Status do modo contingência (contingenciaEnabled, contingenciaInicio, contingenciaMotivo)
   */
  getContingenciaStatus: () => api.get('/fiscal/contingencia/status'),

  /**
   * GET /fiscal/contingencia/pendentes
   * Roles: COMPANY - Listar NFC-e em contingência pendentes de sincronização
   */
  listarContingenciaPendentes: () => api.get('/fiscal/contingencia/pendentes'),

  /**
   * POST /fiscal/contingencia/change-type
   * Roles: COMPANY - Mudar TTD em modo contingência (Art. 5º — 1 vez)
   * Body: { ttdType: 'TTD_706'|'TTD_707'|'TTD_710' }
   */
  changeTtdType: (data: { ttdType: 'TTD_706' | 'TTD_707' | 'TTD_710' }) =>
    api.post('/fiscal/contingencia/change-type', data),

  /**
   * POST /fiscal/contingencia/dtec/credential
   * Roles: COMPANY - Registrar credenciamento DTEC (Art. 2º)
   * Body: { protocol, expiresAt }
   */
  registrarDtecCredential: (data: { protocol: string; expiresAt: string }) =>
    api.post('/fiscal/contingencia/dtec/credential', data),

  /**
   * GET /fiscal/contingencia/dtec/status
   * Roles: COMPANY, ADMIN - Status do credenciamento DTEC
   */
  getDtecStatus: () => api.get('/fiscal/contingencia/dtec/status'),

  /**
   * GET /fiscal/contingencia/termo-compromisso/pdf
   * Roles: COMPANY - Gerar PDF do Termo de Compromisso
   * Query: type ('TTD_706'|'TTD_707'|'TTD_710'|'ALL')
   */
  getTermoCompromissoPdf: (type: 'TTD_706' | 'TTD_707' | 'TTD_710' | 'ALL' = 'ALL') =>
    api.get('/fiscal/contingencia/termo-compromisso/pdf', {
      params: { type },
      responseType: 'blob',
    }),

  /**
   * POST /fiscal/contingencia/aceitar-termo
   * Roles: COMPANY - Aceitar Termo de Compromisso (Anexos I/II)
   * Body: { type: 'TTD_706'|'TTD_707'|'TTD_710'|'ALL' }
   */
  aceitarTermoCompromisso: (data: {
    type: 'TTD_706' | 'TTD_707' | 'TTD_710' | 'ALL';
  }) => api.post('/fiscal/contingencia/aceitar-termo', data),

  /**
   * GET /fiscal/contingencia/termo-compromisso/historico
   * Roles: COMPANY, ADMIN - Histórico de aceites
   */
  listarTermosCompromisso: () => api.get('/fiscal/contingencia/termo-compromisso/historico'),

  /**
   * POST /fiscal/contingencia/sincronizar/:id
   * Roles: COMPANY - Sincronizar 1 NFC-e contingencial com SEFAZ
   */
  sincronizarContingencia: (id: string) =>
    api.post(`/fiscal/contingencia/sincronizar/${id}`),

  /**
   * POST /fiscal/contingencia/sincronizar-todos
   * Roles: COMPANY - Sincronizar todos os pendentes
   */
  sincronizarTodasContingencias: () =>
    api.post('/fiscal/contingencia/sincronizar-todos'),

  /**
   * GET /fiscal/contingencia/bloco-x
   * Roles: COMPANY, ADMIN - Gerar registros do Bloco X (Art. 19 §único)
   * Query: inicio, fim (ISO 8601)
   */
  gerarBlocoX: (inicio: string, fim: string) =>
    api.get('/fiscal/contingencia/bloco-x', { params: { inicio, fim } }),

  /**
   * PATCH /fiscal/contingencia/fuel-retailer
   * Roles: ADMIN - Marcar empresa como revendedor de combustíveis (Art. 3º)
   * Body: { isFuelRetailer, companyId? }
   */
  setFuelRetailer: (data: { isFuelRetailer: boolean; companyId?: string }) =>
    api.patch('/fiscal/contingencia/fuel-retailer', data),

  /**
   * GET /fiscal/contingencia/numeracao
   * Roles: COMPANY, ADMIN - Listar séries de numeração (Art. 13)
   */
  listarNumeracao: () => api.get('/fiscal/contingencia/numeracao'),
};

// ============================================================================
// ESTABLISHMENTS (Multi-estabelecimento — Art. 4º §2º)
// ============================================================================

export const establishmentApi = {
  /** GET /establishments — Lista estabelecimentos ativos da empresa */
  list: () => api.get('/establishments'),

  /** GET /establishments/all — Lista TODOS, inclusive inativos (admin) */
  listAll: () => api.get('/establishments/all'),

  /** GET /establishments/:id */
  get: (id: string) => api.get(`/establishments/${id}`),

  /** POST /establishments — Criar */
  create: (data: {
    cnpj: string;
    name: string;
    stateRegistration?: string;
    address?: string;
    number?: string;
    complement?: string;
    district?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    isMain?: boolean;
    pdvSeries?: Record<string, string>;
  }) => api.post('/establishments', data),

  /** PATCH /establishments/:id */
  update: (id: string, data: any) => api.patch(`/establishments/${id}`, data),

  /** DELETE /establishments/:id — soft delete */
  deactivate: (id: string) => api.delete(`/establishments/${id}`),

  /** DELETE /establishments/:id/hard — hard delete (admin) */
  hardDelete: (id: string) => api.delete(`/establishments/${id}/hard`),

  /** POST /establishments/:id/dtec/credential — Art. 4º §2º */
  credentialDtec: (id: string, data: { protocol: string; expiresAt: string }) =>
    api.post(`/establishments/${id}/dtec/credential`, data),

  /** GET /establishments/:id/nfces — últimas 100 NFC-e do estabelecimento */
  listNfces: (id: string) => api.get(`/establishments/${id}/nfces`),
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
   * POST /cash-closure/withdrawals
   * Roles: COMPANY - Registrar saque no caixa aberto
   * Body: { amount, reason }
   */
  createWithdrawal: (data: { amount: number; reason: string }) =>
    api.post('/cash-closure/withdrawals', data),

  /**
   * GET /cash-closure/withdrawals
   * Roles: COMPANY - Listar saques do caixa aberto
   */
  getWithdrawals: () => api.get('/cash-closure/withdrawals'),

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
// NOTES (ANOTAÇÕES)
// ============================================================================

export const notesApi = {
  /**
   * GET /note
   * Roles: COMPANY, SELLER - Listar anotações
   * Query: search, authorFilter
   */
  list: (params?: { search?: string; authorFilter?: string }) =>
    api.get('/note', { params }),

  /**
   * POST /note
   * Roles: COMPANY, SELLER - Criar anotação
   * Body: { title?, content, visibleToSellers? (company only) }
   */
  create: (data: { title?: string; content: string; visibleToSellers?: boolean }) =>
    api.post('/note', data),

  /**
   * PATCH /note/:id
   * Roles: COMPANY, SELLER - Atualizar anotação
   */
  update: (id: string, data: { title?: string; content?: string; visibleToSellers?: boolean }) =>
    api.patch(`/note/${id}`, data),

  /**
   * DELETE /note/:id
   * Roles: COMPANY, SELLER - Remover anotação
   */
  delete: (id: string) => api.delete(`/note/${id}`),
};

// ============================================================================
// CONTACTS (CONTATOS)
// ============================================================================

export const contactsApi = {
  /**
   * GET /contact
   * Roles: COMPANY, SELLER - Listar contatos
   * Query: search, authorFilter
   */
  list: (params?: { search?: string; authorFilter?: string }) =>
    api.get('/contact', { params }),

  /**
   * POST /contact
   * Roles: COMPANY, SELLER - Criar contato
   * Body: FormData com name, phone?, email?, link?, visibleToSellers? (company), visibleToCompany? (seller), photo?
   */
  create: (data: FormData) =>
    api.post('/contact', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /**
   * PATCH /contact/:id
   * Roles: COMPANY, SELLER - Atualizar contato
   * Body: FormData com campos opcionais + photo?
   */
  update: (id: string, data: FormData) =>
    api.patch(`/contact/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /**
   * DELETE /contact/:id
   * Roles: COMPANY, SELLER - Remover contato
   */
  delete: (id: string) => api.delete(`/contact/${id}`),
};

// ============================================================================
// TASKS (TAREFAS/AGENDA)
// ============================================================================

export const taskApi = {
  /**
   * POST /task
   * Roles: COMPANY, SELLER - Criar tarefa
   * Body: { title, description?, dueDate, type, assignedToId?, assignedToIds?, hasExplicitTime? }
   */
  create: (data: {
    title: string;
    description?: string;
    dueDate: string;
    type: 'PERSONAL' | 'WORK';
    assignedToId?: string;
    assignedToIds?: string[];
    hasExplicitTime?: boolean;
  }) => api.post('/task', data),

  /**
   * GET /task
   * Roles: COMPANY, SELLER - Listar tarefas
   * Query: startDate, endDate, type, isCompleted, assignedToId, search
   */
  list: (params?: {
    startDate?: string;
    endDate?: string;
    type?: 'PERSONAL' | 'WORK';
    isCompleted?: boolean;
    assignedToId?: string;
    search?: string;
  }) => api.get('/task', { params }),

  /**
   * GET /task/:id
   * Roles: COMPANY, SELLER - Buscar tarefa por ID
   */
  get: (id: string) => api.get(`/task/${id}`),

  /**
   * PATCH /task/:id
   * Roles: COMPANY, SELLER - Atualizar tarefa
   * Body: { title?, description?, dueDate?, type?, assignedToId?, assignedToIds?, hasExplicitTime? }
   */
  update: (
    id: string,
    data: {
      title?: string;
      description?: string;
      dueDate?: string;
      type?: 'PERSONAL' | 'WORK';
      assignedToId?: string;
      assignedToIds?: string[];
      hasExplicitTime?: boolean;
    },
  ) => api.patch(`/task/${id}`, data),

  /**
   * DELETE /task/:id
   * Roles: COMPANY, SELLER - Remover tarefa
   */
  delete: (id: string) => api.delete(`/task/${id}`),

  /**
   * PATCH /task/:id/complete
   * Roles: COMPANY, SELLER - Marcar tarefa como concluída
   */
  markComplete: (id: string) => api.patch(`/task/${id}/complete`),

  /**
   * PATCH /task/:id/incomplete
   * Roles: COMPANY, SELLER - Marcar tarefa como não concluída
   */
  markIncomplete: (id: string) => api.patch(`/task/${id}/incomplete`),
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
  single: (file: File, subfolder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/single', formData, {
      params: subfolder ? { subfolder } : undefined,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * POST /upload/multiple
   * Roles: ADMIN, COMPANY
   * multipart/form-data (files[])
   * Body: Múltiplos arquivos + subfolder (opcional)
   */
  multiple: (files: File[], subfolder?: string) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api.post('/upload/multiple', formData, {
      params: subfolder ? { subfolder } : undefined,
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
   * POST /whatsapp/instance/create
   * Roles: ADMIN only
   */
  createInstance: () =>
    api.post('/whatsapp/instance/create', {}),

  /**
   * GET /whatsapp/instance/connect — QR / pareamento
   * Roles: ADMIN only
   */
  connect: () =>
    api.get<{ qr: string | null; pairingCode?: string; instanceName?: string }>('/whatsapp/instance/connect'),

  /**
   * GET /whatsapp/instance/status
   * Roles: ADMIN, COMPANY, SELLER, MANAGER
   */
  getInstanceStatus: () =>
    api.get<{
      hasInstance: boolean;
      connected: boolean;
      status: string;
      instanceName?: string;
      connectedPhone?: string | null;
    }>('/whatsapp/instance/status'),

  /**
   * DELETE /whatsapp/instance/disconnect
   * Roles: ADMIN only
   */
  disconnectInstance: () =>
    api.delete('/whatsapp/instance/disconnect'),

  /**
   * DELETE /whatsapp/instance/delete
   * Roles: ADMIN only
   */
  deleteInstance: () =>
    api.delete('/whatsapp/instance/delete'),

  /**
   * POST /whatsapp/send-message
   * Roles: ADMIN, COMPANY, SELLER, MANAGER
   * Body: { to, message, type, mediaUrl, filename, companyId? }
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
   * Roles: ADMIN, COMPANY, MANAGER
   * Query: companyId (opcional), startDate/endDate (opcional, filtra métricas pelo período)
   */
  metrics: (companyId?: string, startDate?: string, endDate?: string) =>
    api.get('/dashboard/metrics', {
      params: {
        ...(companyId ? { companyId } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      },
    }),
  /**
   * GET /dashboard/metrics/trends
   * Query: companyId (opcional), period: '7d' | '30d' | '90d', startDate/endDate (opcional, do filtro do header)
   */
  trends: (params?: {
    companyId?: string;
    period?: '7d' | '30d' | '90d';
    startDate?: string;
    endDate?: string;
  }) =>
    api.get('/dashboard/metrics/trends', { params: params ?? {} }),
  /**
   * GET /dashboard/metrics/by-store (apenas gestor)
   * Query: startDate, endDate (ISO)
   */
  metricsByStore: (params: { startDate: string; endDate: string }) =>
    api.get('/dashboard/metrics/by-store', { params }),
};

// ============================================================================
// MANAGER (Gestor multilojas)
// ============================================================================

export const managerApi = {
  /** GET /manager/my-companies - Lista lojas que o gestor pode acessar (role gestor) */
  myCompanies: () => api.get('/manager/my-companies'),
  /** GET /manager - Listar gestores (admin) */
  list: () => api.get('/manager'),
  /** GET /manager/:id - Obter gestor (admin) */
  getOne: (id: string) => api.get(`/manager/${id}`),
  /** POST /manager - Criar gestor (admin) */
  create: (data: { login: string; password: string; name?: string }) => api.post('/manager', data),
  /** PATCH /manager/:id - Atualizar gestor (admin) */
  update: (id: string, data: { login?: string; password?: string; name?: string }) => api.patch(`/manager/${id}`, data),
  /** DELETE /manager/:id - Remover gestor (admin) */
  delete: (id: string) => api.delete(`/manager/${id}`),
  /** PUT /manager/:id/companies - Definir lojas do gestor (admin) */
  setCompanies: (id: string, companyIds: string[]) => api.put(`/manager/${id}/companies`, { companyIds }),
};

// ============================================================================
// STOCK TRANSFER (Transferência entre lojas - gestor)
// ============================================================================

export const stockTransferApi = {
  /** POST /stock-transfer - Transferir estoque entre lojas */
  create: (data: { fromCompanyId: string; toCompanyId: string; productId: string; quantity: number }) =>
    api.post('/stock-transfer', data),
  /** GET /stock-transfer - Listar transferências */
  list: (params?: { page?: number; limit?: number; fromCompanyId?: string; toCompanyId?: string; startDate?: string; endDate?: string }) =>
    api.get('/stock-transfer', { params }),
  /** GET /stock-transfer/:id/pdf - Baixar PDF do relatório da transferência */
  getPdf: (id: string) => api.get(`/stock-transfer/${id}/pdf`, { responseType: 'blob' }),
};

// ============================================================================
// CARD ACQUIRER RATE
// ============================================================================

export const cardAcquirerRateApi = {
  /**
   * GET /card-acquirer-rates
   * Roles: COMPANY - Listar todas as taxas de credenciadora
   */
  list: () => api.get('/card-acquirer-rates'),

  /**
   * GET /card-acquirer-rates/:id
   * Roles: COMPANY - Buscar taxa por ID
   */
  get: (id: string) => api.get(`/card-acquirer-rates/${id}`),

  /**
   * POST /card-acquirer-rates
   * Roles: COMPANY - Criar nova taxa de credenciadora
   */
  create: (data: {
    acquirerCnpj: string;
    acquirerName: string;
    debitRate: number;
    creditRate: number;
    installmentRates?: Record<string, number>;
    isActive?: boolean;
  }) => api.post('/card-acquirer-rates', data),

  /**
   * PATCH /card-acquirer-rates/:id
   * Roles: COMPANY - Atualizar taxa de credenciadora
   */
  update: (id: string, data: {
    acquirerCnpj?: string;
    acquirerName?: string;
    debitRate?: number;
    creditRate?: number;
    installmentRates?: Record<string, number>;
    isActive?: boolean;
  }) => api.patch(`/card-acquirer-rates/${id}`, data),

  /**
   * DELETE /card-acquirer-rates/:id
   * Roles: COMPANY - Remover taxa de credenciadora
   */
  delete: (id: string) => api.delete(`/card-acquirer-rates/${id}`),
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

  /**
   * GET /admin/focus-nfe-config
   * Roles: ADMIN - Obter config FocusNFE global (apiKey mascarada + ambiente + ibptToken)
   */
  getFocusNfeConfig: () => api.get('/admin/nfeio-config'),

  /**
   * PATCH /admin/nfeio-config
   * Roles: ADMIN - Atualizar token FocusNFE, ambiente e token IBPT
   */
  updateFocusNfeConfig: (data: { focusNfeApiKey?: string; focusNfeEnvironment?: 'sandbox' | 'production'; ibptToken?: string }) =>
    api.patch('/admin/nfeio-config', {
      ...(data.focusNfeApiKey !== undefined && { nfeioApiKey: data.focusNfeApiKey }),
      ...(data.focusNfeEnvironment !== undefined && { nfeioEnvironment: data.focusNfeEnvironment }),
      ...(data.ibptToken !== undefined && { ibptToken: data.ibptToken }),
    }),

  /**
   * GET /admin/companies/unimake-overview
   * Roles: ADMIN — Lista todas as empresas com o estado da integração Unimake.
   */
  listCompaniesForUnimake: () =>
    api.get<UnimakeCompanyOverviewRow[]>('/admin/companies/unimake-overview'),

  /**
   * GET /admin/companies/:companyId/unimake
   * Roles: ADMIN — Obter configuração Unimake de uma empresa.
   * NÃO retorna o `appKey` — apenas `configured`, `appId` e `sandbox`.
   */
  getCompanyUnimake: (companyId: string) =>
    api.get<UnimakeCompanyConfig>(`/admin/companies/${companyId}/unimake`),

  /**
   * PATCH /admin/companies/:companyId/unimake
   * Roles: ADMIN — Atualizar configuração Unimake (appId / appKey / sandbox).
   * Todos os campos são opcionais (atualização parcial).
   */
  updateCompanyUnimake: (
    companyId: string,
    data: { appId?: string; appKey?: string; configurationId?: string; sandbox?: boolean },
  ) => api.patch<UnimakeCompanyConfig>(`/admin/companies/${companyId}/unimake`, data),
};

// ============================================================================
// TIME CLOCK (Ponto Eletrônico)
// ============================================================================

export const timeClockApi = {
  /**
   * POST /time-clock/register
   * Roles: SELLER - Bater ponto (infere o tipo se não enviado)
   * Body: { type?, latitude?, longitude?, accuracyMeters?, qrToken?, deviceInfo?, notes? }
   */
  register: (data: any) => api.post('/time-clock/register', data),

  /**
   * GET /time-clock/my-today
   * Roles: SELLER - Marcações de hoje + próxima esperada
   */
  myToday: () => api.get('/time-clock/my-today'),

  /**
   * GET /time-clock/my-history
   * Roles: SELLER - Histórico do vendedor (filtros por data/tipo/status)
   */
  myHistory: (params?: any) => api.get('/time-clock/my-history', { params }),

  /**
   * GET /time-clock/my-stats
   * Roles: SELLER - Estatísticas do mês
   */
  myStats: (params?: { month?: string }) =>
    api.get('/time-clock/my-stats', { params }),

  /**
   * GET /time-clock/my-schedule
   * Roles: SELLER - Jornada efetiva do vendedor logado para hoje (com fallback para a empresa)
   */
  mySchedule: () => api.get('/time-clock/my-schedule'),

  /**
   * GET /time-clock/config
   * Roles: COMPANY, ADMIN, MANAGER - Obter configuração de ponto
   */
  getConfig: (params?: { companyId?: string }) =>
    api.get('/time-clock/config', { params }),

  /**
   * PUT /time-clock/config
   * Roles: COMPANY - Atualizar configuração
   */
  updateConfig: (data: any) => api.put('/time-clock/config', data),

  /**
   * POST /time-clock/config/regenerate-qr
   * Roles: COMPANY - Rotacionar o QR estático
   */
  regenerateQr: () => api.post('/time-clock/config/regenerate-qr'),

  /**
   * GET /time-clock/qr-code
   * Roles: COMPANY - QR em base64 PNG para imprimir
   */
  getQrCode: () => api.get('/time-clock/qr-code'),

  /**
   * GET /time-clock
   * Roles: COMPANY, MANAGER, ADMIN - Listar marcações com filtros
   */
  list: (params?: any) => api.get('/time-clock', { params }),

  /**
   * GET /time-clock/pending
   * Roles: COMPANY, MANAGER - Pontos pendentes de aprovação
   */
  pending: () => api.get('/time-clock/pending'),

  /**
   * GET /time-clock/seller/:sellerId
   * Roles: COMPANY, MANAGER, ADMIN - Histórico de um funcionário
   */
  bySeller: (sellerId: string, params?: any) =>
    api.get(`/time-clock/seller/${sellerId}`, { params }),

  /**
   * POST /time-clock/:id/approve
   * Roles: COMPANY, MANAGER, ADMIN - Aprovar ponto pendente
   */
  approve: (id: string) => api.post(`/time-clock/${id}/approve`),

  /**
   * POST /time-clock/:id/reject
   * Roles: COMPANY, MANAGER, ADMIN - Rejeitar marcação
   * Body: { reason: string }
   */
  reject: (id: string, data: { reason: string }) =>
    api.post(`/time-clock/${id}/reject`, data),

  /**
   * POST /time-clock/:id/adjust
   * Roles: COMPANY, MANAGER, ADMIN - Corrigir manualmente
   * Body: { type?, timestamp?, latitude?, longitude?, reason }
   */
  adjust: (id: string, data: any) => api.post(`/time-clock/${id}/adjust`, data),

  /**
   * GET /time-clock/stats
   * Roles: COMPANY, MANAGER - Estatísticas agregadas
   */
  stats: (params?: { month?: string }) =>
    api.get('/time-clock/stats', { params }),

  /**
   * GET /time-clock/report/pdf
   * Roles: COMPANY, MANAGER, ADMIN - Espelho mensal em PDF (blob)
   */
  reportPdf: (params?: any) =>
    api.get('/time-clock/report/pdf', { params, responseType: 'blob' }),

  /**
   * GET /time-clock/report/csv
   * Roles: COMPANY, MANAGER, ADMIN - Exportar pontos em CSV (blob)
   */
  reportCsv: (params?: any) =>
    api.get('/time-clock/report/csv', { params, responseType: 'blob' }),
};

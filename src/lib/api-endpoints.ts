/**
 * API Endpoints - Documentação completa dos endpoints disponíveis
 * Baseado na documentação oficial da API
 */

import { api } from './apiClient';
import type { DataPeriodFilter } from '@/types';

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
   * Roles: COMPANY - Upload do certificado digital
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
   * PATCH /company/:id/focus-nfe-config
   * Roles: ADMIN - Atualizar configuração do Focus NFe da empresa
   */
  updateFocusNfeConfig: (id: string, data: any) => api.patch(`/company/${id}/focus-nfe-config`, data),

  /**
   * GET /company/:id/focus-nfe-config
   * Roles: ADMIN - Obter configuração do Focus NFe da empresa
   */
  getFocusNfeConfig: (id: string) => api.get(`/company/${id}/focus-nfe-config`),

  /**
   * GET /company/:id/fiscal-config
   * Roles: ADMIN - Obter configurações fiscais completas da empresa (sem mascaramento)
   */
  getFiscalConfigForAdmin: (id: string) => api.get(`/company/${id}/fiscal-config`),
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
   * Roles: ADMIN, COMPANY, MANAGER
   * Query (gestor): companyId opcional; omitir = agregado de todas as lojas
   */
  metrics: (companyId?: string) =>
    api.get('/dashboard/metrics', { params: companyId ? { companyId } : {} }),
  /**
   * GET /dashboard/metrics/trends
   * Query: companyId (opcional), period: '7d' | '30d' | '90d'
   */
  trends: (params?: { companyId?: string; period?: '7d' | '30d' | '90d' }) =>
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
   * PATCH /admin/focus-nfe-config
   * Roles: ADMIN - Atualizar configuração global do Focus NFe
   * Body: { focusNfeApiKey?, focusNfeEnvironment?, ibptToken? }
   */
  updateFocusNfeConfig: (data: any) => api.patch('/admin/focus-nfe-config', data),

  /**
   * GET /admin/focus-nfe-config
   * Roles: ADMIN - Obter configuração global do Focus NFe
   */
  getFocusNfeConfig: () => api.get('/admin/focus-nfe-config'),
};

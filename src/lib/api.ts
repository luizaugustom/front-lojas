import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import type { UserRole } from '@/types';
import { createAxiosUUIDInterceptor } from './api-uuid-interceptor';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const USE_MOCK = false; // Sempre usar backend real

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // UUID Validation interceptor (primeiro - valida antes de tudo)
    const uuidInterceptor = createAxiosUUIDInterceptor();
    this.client.interceptors.request.use(
      (config) => {
        // Validar UUIDs primeiro
        config = uuidInterceptor.request(config);
        
        // Depois adicionar token
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Validar UUIDs na resposta
        return uuidInterceptor.response(response);
      },
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // Auth
  /**
   * POST /auth/login
   * Realizar login no sistema
   * Autenticação: Não requerida
   * Body: { login: string, password: string }
   * Resposta: { access_token: string, user: { id, login, role, companyId, name } }
   */
  async login(login: string, password: string) {
    const response = await this.client.post('/auth/login', { login, password });
    console.log('API login response:', response.data);
    
    // Normalizar resposta da API
    const data = response.data.data || response.data;
    
    // Mapear access_token para token
    const token = data.access_token || data.token;
    const user = data.user;
    
    // Mapear roles da API para roles do frontend
    if (user && user.role) {
      const roleMap: Record<string, string> = {
        'admin': 'admin',
        'company': 'empresa',
        'seller': 'vendedor',
      };
      user.role = (roleMap[user.role] || user.role) as UserRole;
    }
    
    return { user, token };
  }

  /**
   * GET /auth/me
   * Obter dados do usuário logado
   * Autenticação: Requerida (Bearer token)
   * Resposta: { user: { id, login, role, companyId, name } }
   */
  async me() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  /**
   * GET /auth/profile
   * Obter perfil completo do usuário autenticado
   * Autenticação: Requerida (Bearer token)
   * Resposta: Dados completos do perfil do usuário
   */
  async getProfile() {
    const response = await this.client.get('/auth/profile');
    return response.data;
  }

  /**
   * PUT /auth/profile
   * Atualizar perfil do usuário autenticado
   * Autenticação: Requerida (Bearer token)
   * Body: { name?: string, email?: string, phone?: string, login?: string }
   * Resposta: Perfil atualizado
   */
  async updateProfile(data: { name?: string; email?: string; phone?: string; login?: string }) {
    const response = await this.client.put('/auth/profile', data);
    return response.data;
  }

  /**
   * POST /auth/change-password
   * Alterar senha do usuário autenticado
   * Autenticação: Requerida (Bearer token)
   * Body: { currentPassword: string, newPassword: string }
   * Resposta: { message: string }
   */
  async changePassword(currentPassword: string, newPassword: string) {
    const response = await this.client.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  // Products
  /**
   * GET /product
   * Listar produtos
   * Permissão: ADMIN, COMPANY, SELLER
   * Query Parameters: page (opcional), limit (opcional), search (opcional)
   */
  async getProducts(params?: any) {
    const response = await this.client.get('/product', { params });
    return response.data;
  }

  /**
   * GET /product/:id
   * Buscar produto por ID
   * Permissão: ADMIN, COMPANY, SELLER
   */
  async getProduct(id: string) {
    const response = await this.client.get(`/product/${id}`);
    return response.data;
  }

  /**
   * GET /product/barcode/:barcode
   * Buscar produto por código de barras
   * Permissão: ADMIN, COMPANY, SELLER
   */
  async getProductByBarcode(barcode: string) {
    const response = await this.client.get(`/product/barcode/${barcode}`);
    return response.data;
  }

  /**
   * POST /product
   * Criar novo produto
   * Permissão: COMPANY
   * Body: { name, photos, barcode, size, stockQuantity, price, category, expirationDate }
   */
  async createProduct(data: any) {
    const response = await this.client.post('/product', data);
    return response.data;
  }

  /**
   * PATCH /product/:id
   * Atualizar produto
   * Permissão: ADMIN, COMPANY
   * Body: Mesma estrutura do POST (campos opcionais)
   */
  async updateProduct(id: string, data: any) {
    const response = await this.client.patch(`/product/${id}`, data);
    return response.data;
  }

  /**
   * DELETE /product/:id
   * Remover produto
   * Permissão: ADMIN, COMPANY
   */
  async deleteProduct(id: string) {
    const response = await this.client.delete(`/product/${id}`);
    return response.data;
  }

  // Sales
  /**
   * GET /sale
   * Listar vendas
   * Permissão: ADMIN, COMPANY, SELLER
   * Query Parameters: page (opcional), limit (opcional), sellerId (opcional), startDate (opcional), endDate (opcional)
   */
  async getSales(params?: any) {
    const response = await this.client.get('/sale', { params });
    return response.data;
  }

  /**
   * GET /sale/:id
   * Buscar venda por ID
   * Permissão: ADMIN, COMPANY, SELLER
   */
  async getSale(id: string) {
    const response = await this.client.get(`/sale/${id}`);
    return response.data;
  }

  /**
   * POST /sale
   * Criar nova venda
   * Permissão: COMPANY, SELLER
   * Body: { sellerId, items: [{ productId, quantity, unitPrice, totalPrice }], clientCpfCnpj, clientName, paymentMethods: [{ method, amount }], totalPaid }
   */
  async createSale(data: any) {
    const response = await this.client.post('/sale', data);
    return response.data;
  }

  /**
   * POST /sale/exchange
   * Processar troca de produto
   * Permissão: COMPANY
   * Body: { originalSaleId, newItems: [{ productId, quantity, unitPrice, totalPrice }], reason }
   */
  async exchangeSale(data: any) {
    const response = await this.client.post('/sale/exchange', data);
    return response.data;
  }

  // Customers
  /**
   * GET /customer
   * Listar clientes
   * Permissão: ADMIN, COMPANY
   * Query Parameters: page (opcional), limit (opcional), search (opcional)
   */
  async getCustomers(params?: any) {
    const response = await this.client.get('/customer', { params });
    return response.data;
  }

  /**
   * GET /customer/:id
   * Buscar cliente por ID
   * Permissão: ADMIN, COMPANY
   */
  async getCustomer(id: string) {
    const response = await this.client.get(`/customer/${id}`);
    return response.data;
  }

  /**
   * POST /customer
   * Criar novo cliente
   * Permissão: COMPANY
   * Body: { name, phone, email, cpfCnpj, zipCode, state, city, district, street, number, complement }
   */
  async createCustomer(data: any) {
    const response = await this.client.post('/customer', data);
    return response.data;
  }

  /**
   * PATCH /customer/:id
   * Atualizar cliente
   * Permissão: ADMIN, COMPANY
   * Body: Mesma estrutura do POST (campos opcionais)
   */
  async updateCustomer(id: string, data: any) {
    const response = await this.client.patch(`/customer/${id}`, data);
    return response.data;
  }

  /**
   * DELETE /customer/:id
   * Remover cliente
   * Permissão: ADMIN, COMPANY
   */
  async deleteCustomer(id: string) {
    const response = await this.client.delete(`/customer/${id}`);
    return response.data;
  }

  /**
   * POST /customer/send-bulk-promotional-email
   * Enviar email promocional para todos os clientes
   * Permissão: ADMIN, COMPANY
   * Body: { subject, message }
   */
  async sendBulkPromotionalEmail(data: {
    title: string;
    message: string;
    description: string;
    discount: string;
    validUntil: string;
  }) {
    const response = await this.client.post('/customer/send-bulk-promotional-email', data);
    return response.data;
  }

  // Bills to Pay
  /**
   * GET /bill-to-pay
   * Listar contas a pagar
   * Permissão: ADMIN, COMPANY
   * Query Parameters: page (opcional), limit (opcional), isPaid (opcional), startDate (opcional), endDate (opcional)
   */
  async getBills(params?: any) {
    const response = await this.client.get('/bill-to-pay', { params });
    return response.data;
  }

  /**
   * POST /bill-to-pay
   * Criar nova conta a pagar
   * Permissão: COMPANY
   * Body: { title, barcode, paymentInfo, dueDate, amount }
   */
  async createBill(data: any) {
    const response = await this.client.post('/bill-to-pay', data);
    return response.data;
  }

  /**
   * PATCH /bill-to-pay/:id/mark-paid
   * Marcar conta como paga
   * Permissão: ADMIN, COMPANY
   * Body: { paidDate, paidAmount, notes }
   */
  async markBillAsPaid(id: string) {
    const response = await this.client.patch(`/bill-to-pay/${id}/mark-paid`);
    return response.data;
  }

  // Cash Closure
  /**
   * POST /cash-closure
   * Abrir novo fechamento de caixa
   * Permissão: COMPANY
   * Body: { openingAmount }
   */
  async openCashClosure(data: any) {
    const response = await this.client.post('/cash-closure', data);
    return response.data;
  }

  /**
   * GET /cash-closure/current
   * Obter fechamento de caixa atual
   * Permissão: COMPANY
   */
  async getCurrentCashClosure() {
    const response = await this.client.get('/cash-closure/current');
    return response.data;
  }

  /**
   * PATCH /cash-closure/close
   * Fechar fechamento de caixa atual
   * Permissão: COMPANY
   * Body: { closingAmount, notes }
   */
  async closeCashClosure(data: any) {
    const response = await this.client.patch('/cash-closure/close', data);
    return response.data;
  }

  // Upload
  /**
   * POST /upload/single
   * Fazer upload de um arquivo
   * Permissão: ADMIN, COMPANY
   * Content-Type: multipart/form-data
   * Body: Arquivo + subfolder (opcional)
   */
  async uploadSingle(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * POST /upload/multiple
   * Fazer upload de múltiplos arquivos
   * Permissão: ADMIN, COMPANY
   * Content-Type: multipart/form-data
   * Body: Múltiplos arquivos + subfolder (opcional)
   */
  async uploadMultiple(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const response = await this.client.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Reports
  /**
   * POST /reports/generate
   * Gerar relatório completo para contabilidade
   * Permissão: COMPANY
   * Body: { reportType, format, startDate, endDate, includeProducts, includeCustomers, includeFiscal }
   * Formatos disponíveis: json, xml, excel
   * Tipos de relatório: sales, products, customers, fiscal, complete
   */
  async generateReport(data: any) {
    const response = await this.client.post('/reports/generate', data, {
      responseType: 'blob',
    });
    return response;
  }

  // Sellers
  /**
   * GET /seller
   * Listar vendedores
   * Permissão: ADMIN, COMPANY
   */
  async getSellers(params?: any) {
    const response = await this.client.get('/seller', { params });
    return response.data;
  }

  /**
   * GET /seller/:id
   * Buscar vendedor por ID
   * Permissão: ADMIN, COMPANY
   */
  async getSeller(id: string) {
    const response = await this.client.get(`/seller/${id}`);
    return response.data;
  }

  /**
   * POST /seller
   * Criar novo vendedor
   * Permissão: COMPANY
   * Body: { login, password, name, phone, email }
   */
  async createSeller(data: any) {
    const response = await this.client.post('/seller', data);
    return response.data;
  }

  /**
   * PATCH /seller/:id
   * Atualizar vendedor
   * Permissão: ADMIN, COMPANY
   * Body: Mesma estrutura do POST (campos opcionais)
   */
  async updateSeller(id: string, data: any) {
    const response = await this.client.patch(`/seller/${id}`, data);
    return response.data;
  }

  /**
   * DELETE /seller/:id
   * Remover vendedor
   * Permissão: ADMIN, COMPANY
   */
  async deleteSeller(id: string) {
    const response = await this.client.delete(`/seller/${id}`);
    return response.data;
  }

  /**
   * GET /seller/:id/stats
   * Obter estatísticas do vendedor
   * Permissão: ADMIN, COMPANY
   */
  async getSellerStats(id: string) {
    const response = await this.client.get(`/seller/${id}/stats`);
    return response.data;
  }

  /**
   * GET /seller/:id/sales
   * Obter vendas do vendedor
   * Permissão: ADMIN, COMPANY
   * Query Parameters: page (opcional), limit (opcional)
   */
  async getSellerSales(id: string, params?: any) {
    const response = await this.client.get(`/seller/${id}/sales`, { params });
    return response.data;
  }

  // Seller Profile (quando logado como vendedor)
  /**
   * GET /seller/my-profile
   * Obter perfil do vendedor logado
   * Permissão: SELLER
   */
  async getMyProfile() {
    const response = await this.client.get('/seller/my-profile');
    return response.data;
  }

  /**
   * GET /seller/my-stats
   * Obter estatísticas do vendedor logado
   * Permissão: SELLER
   */
  async getMyStats() {
    const response = await this.client.get('/seller/my-stats');
    return response.data;
  }

  /**
   * GET /seller/my-sales
   * Obter vendas do vendedor logado
   * Permissão: SELLER
   * Query Parameters: page (opcional), limit (opcional)
   */
  async getMySales(params?: any) {
    const response = await this.client.get('/seller/my-sales', { params });
    return response.data;
  }

  /**
   * PATCH /seller/my-profile
   * Atualizar perfil do vendedor logado
   * Permissão: SELLER
   * Body: Mesma estrutura do POST (campos opcionais)
   */
  async updateMyProfile(data: any) {
    const response = await this.client.patch('/seller/my-profile', data);
    return response.data;
  }

  // Dashboard
  /**
   * GET /dashboard/metrics
   * Obter métricas do dashboard
   * Permissão: ADMIN, COMPANY, SELLER
   */
  async getDashboardMetrics() {
    const response = await this.client.get('/dashboard/metrics');
    return response.data;
  }

  // Notifications
  /**
   * GET /notification
   * Listar notificações do usuário autenticado
   * Autenticação: Requerida (Bearer token)
   * Query Parameters: onlyUnread (opcional)
   */
  async getNotifications(onlyUnread?: boolean) {
    const params = onlyUnread ? { onlyUnread: true } : {};
    const response = await this.client.get('/notification', { params });
    return response.data;
  }

  /**
   * GET /notification/unread-count
   * Obter contagem de notificações não lidas
   * Autenticação: Requerida (Bearer token)
   */
  async getUnreadNotificationsCount() {
    const response = await this.client.get('/notification/unread-count');
    return response.data;
  }

  /**
   * GET /notification/:id
   * Obter notificação por ID
   * Autenticação: Requerida (Bearer token)
   */
  async getNotification(id: string) {
    const response = await this.client.get(`/notification/${id}`);
    return response.data;
  }

  /**
   * PUT /notification/:id/read
   * Marcar notificação como lida
   * Autenticação: Requerida (Bearer token)
   */
  async markNotificationAsRead(id: string) {
    const response = await this.client.put(`/notification/${id}/read`);
    return response.data;
  }

  /**
   * PUT /notification/read-all
   * Marcar todas as notificações como lidas
   * Autenticação: Requerida (Bearer token)
   */
  async markAllNotificationsAsRead() {
    const response = await this.client.put('/notification/read-all');
    return response.data;
  }

  /**
   * DELETE /notification/:id
   * Deletar notificação
   * Autenticação: Requerida (Bearer token)
   */
  async deleteNotification(id: string) {
    const response = await this.client.delete(`/notification/${id}`);
    return response.data;
  }

  /**
   * GET /notification/preferences/me
   * Obter preferências de notificação do usuário
   * Autenticação: Requerida (Bearer token)
   */
  async getNotificationPreferences() {
    const response = await this.client.get('/notification/preferences/me');
    return response.data;
  }

  /**
   * PUT /notification/preferences
   * Atualizar preferências de notificação
   * Autenticação: Requerida (Bearer token)
   * Body: { stockAlerts?, billReminders?, weeklyReports?, salesAlerts?, systemUpdates?, emailEnabled?, inAppEnabled? }
   */
  async updateNotificationPreferences(data: {
    stockAlerts?: boolean;
    billReminders?: boolean;
    weeklyReports?: boolean;
    salesAlerts?: boolean;
    systemUpdates?: boolean;
    emailEnabled?: boolean;
    inAppEnabled?: boolean;
  }) {
    const response = await this.client.put('/notification/preferences', data);
    return response.data;
  }

  // Métodos HTTP genéricos para compatibilidade com código existente
  /**
   * Método GET genérico
   */
  async get(url: string, config?: any) {
    return await this.client.get(url, config);
  }

  /**
   * Método POST genérico
   */
  async post(url: string, data?: any, config?: any) {
    return await this.client.post(url, data, config);
  }

  /**
   * Método PATCH genérico
   */
  async patch(url: string, data?: any, config?: any) {
    return await this.client.patch(url, data, config);
  }

  /**
   * Método PUT genérico
   */
  async put(url: string, data?: any, config?: any) {
    return await this.client.put(url, data, config);
  }

  /**
   * Método DELETE genérico
   */
  async delete(url: string, config?: any) {
    return await this.client.delete(url, config);
  }
}

export const api = new ApiClient();

export function handleApiError(error: any) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message || 'Erro desconhecido';
    toast.error(message);
  } else {
    toast.error('Erro desconhecido');
  }
}

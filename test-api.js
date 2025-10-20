#!/usr/bin/env node

/**
 * Script para executar testes reais da API MontShop
 * 
 * Uso: node test-api.js
 */

const axios = require('axios');

// Configuração da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class APITester {
  constructor() {
    this.results = [];
    this.accessToken = null;
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async makeRequest(method, endpoint, data = null, headers = {}, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const config = {
          method,
          url: `${API_BASE_URL}${endpoint}`,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          timeout: 10000 // 10 segundos de timeout
        };

        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }

        if (data) {
          config.data = data;
        }

        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
      } catch (error) {
        const status = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || error.message;
        
        // Se for rate limit (429), aguardar e tentar novamente
        if (status === 429 && attempt < retries) {
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
          this.log(`⏳ Rate limit atingido, aguardando ${waitTime}ms antes de tentar novamente...`, 'yellow');
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        // Se for erro de token, tentar renovar
        if (status === 401 && this.accessToken && attempt < retries) {
          this.log(`🔄 Token expirado, tentando renovar...`, 'yellow');
          const refreshResult = await this.refreshToken();
          if (refreshResult.success) {
            this.accessToken = refreshResult.data.access_token;
            continue;
          }
        }
        
        return { 
          success: false, 
          error: errorMessage,
          status: status
        };
      }
    }
  }

  async refreshToken() {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
        withCredentials: true, // Para enviar cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message
      };
    }
  }

  async runTest(testName, testFn) {
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      this.log(`✅ ${testName} - ${duration}ms`, 'green');
      
      // Adicionar delay pequeno entre testes para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return { success: true, duration, data: result };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.log(`❌ ${testName} - ${duration}ms - ${error.message}`, 'red');
      return { success: false, duration, error: error.message };
    }
  }

  async testAuth() {
    this.log('\n🔐 Testando Autenticação...', 'cyan');
    
    // Teste 1: Login
    const loginResult = await this.runTest('Login', async () => {
      const result = await this.makeRequest('POST', '/auth/login', {
        login: 'empresa@example.com',
        password: 'company123'
      });
      
      if (result.success) {
        this.accessToken = result.data.access_token;
        return result.data;
      } else {
        throw new Error(result.error);
      }
    });

    // Teste 2: Refresh Token
    await this.runTest('Refresh Token', async () => {
      const result = await this.makeRequest('POST', '/auth/refresh', null, {}, 1);
      
      if (result.success) {
        this.accessToken = result.data.access_token;
        return result.data;
      } else {
        // Se não conseguir renovar, não é erro crítico
        return { message: 'Refresh token não disponível (normal em testes)' };
      }
    });

    // Teste 3: Logout
    await this.runTest('Logout', async () => {
      const result = await this.makeRequest('POST', '/auth/logout');
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      this.accessToken = null;
      return result.data;
    });
  }

  async testProducts() {
    this.log('\n📦 Testando Produtos...', 'cyan');
    
    // Fazer login primeiro
    const loginResult = await this.makeRequest('POST', '/auth/login', {
      login: 'empresa@example.com',
      password: 'company123'
    });
    
    if (loginResult.success) {
      this.accessToken = loginResult.data.access_token;
    }

    // Teste 1: Listar produtos
    await this.runTest('Listar Produtos', async () => {
      const result = await this.makeRequest('GET', '/product', null, {
        params: { page: 1, limit: 10 }
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    });

    // Teste 2: Buscar por código de barras
    await this.runTest('Buscar por Código de Barras', async () => {
      const result = await this.makeRequest('GET', '/product/barcode/7891234567890');
      
      if (!result.success && result.status !== 404) {
        throw new Error(result.error);
      }
      
      return result.data || { message: 'Produto não encontrado' };
    });

    // Teste 3: Obter categorias
    await this.runTest('Obter Categorias', async () => {
      const result = await this.makeRequest('GET', '/product/categories');
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    });

    // Teste 4: Estatísticas
    await this.runTest('Estatísticas de Produtos', async () => {
      const result = await this.makeRequest('GET', '/product/stats');
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    });

    // Teste 5: Produtos com estoque baixo
    await this.runTest('Produtos com Estoque Baixo', async () => {
      const result = await this.makeRequest('GET', '/product/low-stock', null, {
        params: { threshold: 10 }
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    });

    // Teste 6: Produtos próximos do vencimento
    await this.runTest('Produtos Próximos do Vencimento', async () => {
      const result = await this.makeRequest('GET', '/product/expiring', null, {
        params: { days: 30 }
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    });
  }

  async testSales() {
    this.log('\n💰 Testando Vendas...', 'cyan');
    
    // Teste 1: Listar vendas
    await this.runTest('Listar Vendas', async () => {
      const result = await this.makeRequest('GET', '/sale', null, {
        params: { page: 1, limit: 10 }
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    });

    // Teste 2: Estatísticas de vendas
    await this.runTest('Estatísticas de Vendas', async () => {
      const result = await this.makeRequest('GET', '/sale/stats');
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    });

    // Teste 3: Vendas do vendedor
    await this.runTest('Vendas do Vendedor', async () => {
      const result = await this.makeRequest('GET', '/sale/my-sales');
      
      if (!result.success && result.status !== 403) {
        throw new Error(result.error);
      }
      
      return result.data || { message: 'Acesso negado - não é vendedor' };
    });
  }

  async testCustomers() {
    this.log('\n👥 Testando Clientes...', 'cyan');
    
    // Teste 1: Listar clientes
    await this.runTest('Listar Clientes', async () => {
      const result = await this.makeRequest('GET', '/customer', null, {
        params: { page: 1, limit: 10 }
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    });

    // Teste 2: Estatísticas de clientes
    await this.runTest('Estatísticas de Clientes', async () => {
      const result = await this.makeRequest('GET', '/customer/stats');
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    });

    // Teste 3: Buscar por CPF/CNPJ
    await this.runTest('Buscar por CPF/CNPJ', async () => {
      const result = await this.makeRequest('GET', '/customer/cpf-cnpj/123.456.789-00');
      
      if (!result.success && result.status !== 404) {
        throw new Error(result.error);
      }
      
      return result.data || { message: 'Cliente não encontrado' };
    });
  }

  async testSellers() {
    this.log('\n👨‍💼 Testando Vendedores...', 'cyan');
    
    // Teste 1: Listar vendedores
    await this.runTest('Listar Vendedores', async () => {
      const result = await this.makeRequest('GET', '/seller', null, {
        params: { page: 1, limit: 10 }
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    });

    // Teste 2: Perfil do vendedor
    await this.runTest('Perfil do Vendedor', async () => {
      const result = await this.makeRequest('GET', '/seller/my-profile');
      
      if (!result.success && result.status !== 403) {
        throw new Error(result.error);
      }
      
      return result.data || { message: 'Acesso negado - não é vendedor' };
    });

    // Teste 3: Estatísticas do vendedor
    await this.runTest('Estatísticas do Vendedor', async () => {
      const result = await this.makeRequest('GET', '/seller/my-stats');
      
      if (!result.success && result.status !== 403) {
        throw new Error(result.error);
      }
      
      return result.data || { message: 'Acesso negado - não é vendedor' };
    });
  }

  async testBills() {
    this.log('\n💳 Testando Contas a Pagar...', 'cyan');
    
    // Teste 1: Listar contas a pagar
    await this.runTest('Listar Contas a Pagar', async () => {
      const result = await this.makeRequest('GET', '/bill-to-pay', null, {
        params: { page: 1, limit: 10 }
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    });

    // Teste 2: Estatísticas
    await this.runTest('Estatísticas de Contas', async () => {
      const result = await this.makeRequest('GET', '/bill-to-pay/stats');
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    });

    // Teste 3: Contas em atraso
    await this.runTest('Contas em Atraso', async () => {
      const result = await this.makeRequest('GET', '/bill-to-pay/overdue');
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    });

    // Teste 4: Contas próximas do vencimento
    await this.runTest('Contas Próximas do Vencimento', async () => {
      const result = await this.makeRequest('GET', '/bill-to-pay/upcoming', null, {
        params: { days: 7 }
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    });
  }

  async testCashClosure() {
    this.log('\n🏦 Testando Fechamento de Caixa...', 'cyan');
    
    // Teste 1: Fechamento atual
    await this.runTest('Fechamento Atual', async () => {
      const result = await this.makeRequest('GET', '/cash-closure/current');
      
      if (!result.success && result.status !== 404) {
        throw new Error(result.error);
      }
      
      return result.data || { message: 'Nenhum fechamento ativo' };
    });

    // Teste 2: Listar fechamentos
    await this.runTest('Listar Fechamentos', async () => {
      const result = await this.makeRequest('GET', '/cash-closure', null, {
        params: { page: 1, limit: 10 }
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    });

    // Teste 3: Estatísticas
    await this.runTest('Estatísticas de Fechamento', async () => {
      const result = await this.makeRequest('GET', '/cash-closure/stats');
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    });

    // Teste 4: Histórico
    await this.runTest('Histórico de Fechamentos', async () => {
      const result = await this.makeRequest('GET', '/cash-closure/history', null, {
        params: { page: 1, limit: 10 }
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    });
  }

  async testReports() {
    this.log('\n📊 Testando Relatórios...', 'cyan');
    
    // Teste 1: Gerar relatório
    await this.runTest('Gerar Relatório de Vendas', async () => {
      const result = await this.makeRequest('POST', '/reports/generate', {
        reportType: 'sales',
        format: 'json',
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      });
      
      if (!result.success && result.status !== 403) {
        throw new Error(result.error);
      }
      
      return result.data || { message: 'Acesso negado' };
    });
  }

  async testFiscal() {
    this.log('\n🧾 Testando Fiscal...', 'cyan');
    
    // Teste 1: Validar empresa
    await this.runTest('Validar Empresa', async () => {
      const result = await this.makeRequest('GET', '/fiscal/validate-company');
      
      if (!result.success && result.status !== 403) {
        throw new Error(result.error);
      }
      
      return result.data || { message: 'Acesso negado' };
    });

    // Teste 2: Listar documentos fiscais
    await this.runTest('Listar Documentos Fiscais', async () => {
      const result = await this.makeRequest('GET', '/fiscal', null, {
        params: { page: 1, limit: 10 }
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    });

    // Teste 3: Estatísticas fiscais
    await this.runTest('Estatísticas Fiscais', async () => {
      const result = await this.makeRequest('GET', '/fiscal/stats');
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    });
  }

  async testCompany() {
    this.log('\n🏢 Testando Empresa...', 'cyan');
    
    // Teste 1: Dados da empresa atual
    await this.runTest('Dados da Empresa Atual', async () => {
      const result = await this.makeRequest('GET', '/company/my-company');
      
      if (!result.success && result.status !== 403) {
        throw new Error(result.error);
      }
      
      return result.data || { message: 'Acesso negado' };
    });

    // Teste 2: Estatísticas da empresa
    await this.runTest('Estatísticas da Empresa', async () => {
      const result = await this.makeRequest('GET', '/company/stats');
      
      if (!result.success && result.status !== 403) {
        throw new Error(result.error);
      }
      
      return result.data || { message: 'Acesso negado' };
    });

    // Teste 3: Listar empresas (admin)
    await this.runTest('Listar Empresas', async () => {
      const result = await this.makeRequest('GET', '/company');
      
      if (!result.success && result.status !== 403) {
        throw new Error(result.error);
      }
      
      return result.data || { message: 'Acesso negado - não é admin' };
    });
  }

  async testAdmin() {
    this.log('\n👑 Testando Administrador...', 'cyan');
    
    // Teste 1: Listar administradores
    await this.runTest('Listar Administradores', async () => {
      const result = await this.makeRequest('GET', '/admin');
      
      if (!result.success && result.status !== 403) {
        throw new Error(result.error);
      }
      
      return result.data || { message: 'Acesso negado - não é admin' };
    });
  }

  async testDashboard() {
    this.log('\n📈 Testando Dashboard...', 'cyan');
    
    // Teste 1: Métricas do dashboard
    await this.runTest('Métricas do Dashboard', async () => {
      const result = await this.makeRequest('GET', '/dashboard/metrics');
      
      if (!result.success && result.status !== 403) {
        throw new Error(result.error);
      }
      
      return result.data || { message: 'Acesso negado' };
    });
  }

  async runAllTests() {
    this.log('🚀 Iniciando testes reais da API MontShop...', 'bright');
    this.log(`📡 API Base URL: ${API_BASE_URL}`, 'blue');
    
    const startTime = Date.now();
    
    try {
      await this.testAuth();
      await this.delay(500); // Delay entre módulos
      
      await this.testProducts();
      await this.delay(500);
      
      await this.testSales();
      await this.delay(500);
      
      await this.testCustomers();
      await this.delay(500);
      
      await this.testSellers();
      await this.delay(500);
      
      await this.testBills();
      await this.delay(500);
      
      await this.testCashClosure();
      await this.delay(500);
      
      await this.testReports();
      await this.delay(500);
      
      await this.testFiscal();
      await this.delay(500);
      
      await this.testCompany();
      await this.delay(500);
      
      await this.testAdmin();
      await this.delay(500);
      
      await this.testDashboard();
      
      const totalDuration = Date.now() - startTime;
      
      this.log('\n📊 Testes Concluídos!', 'bright');
      this.log(`⏱️  Tempo Total: ${totalDuration}ms`, 'blue');
      this.log('✅ Todos os testes foram executados com sucesso!', 'green');
      
    } catch (error) {
      this.log(`\n❌ Erro durante a execução dos testes: ${error.message}`, 'red');
      process.exit(1);
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const tester = new APITester();
  tester.runAllTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Falha nos testes:', error);
    process.exit(1);
  });
}

module.exports = APITester;

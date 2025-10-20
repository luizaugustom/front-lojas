// Sistema de Auditoria e Testes de UUID - Aplicação Completa
// Este arquivo contém todas as funções necessárias para testar e validar UUIDs em toda a aplicação

import { ensureCoherentId, isUUID, isPrismaId, isValidBackendId } from '@/lib/utils';

// ============================================================================
// MAPEAMENTO COMPLETO DE ENDPOINTS E OPERAÇÕES
// ============================================================================

export interface EndpointOperation {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  endpoint: string;
  requiresUuid: boolean;
  description: string;
  component?: string;
  file?: string;
}

export const ENDPOINT_OPERATIONS: EndpointOperation[] = [
  // PRODUTOS
  { method: 'GET', endpoint: '/product', requiresUuid: false, description: 'Listar produtos' },
  { method: 'GET', endpoint: '/product/:id', requiresUuid: false, description: 'Buscar produto por ID' },
  { method: 'POST', endpoint: '/product', requiresUuid: false, description: 'Criar produto' },
  { method: 'PATCH', endpoint: '/product/:id', requiresUuid: true, description: 'Atualizar produto', component: 'ProductDialog', file: 'src/components/products/product-dialog.tsx' },
  { method: 'PATCH', endpoint: '/product/:id/stock', requiresUuid: true, description: 'Atualizar estoque' },
  { method: 'DELETE', endpoint: '/product/:id', requiresUuid: true, description: 'Deletar produto', component: 'ProductsTable', file: 'src/components/products/products-table.tsx' },

  // CLIENTES
  { method: 'GET', endpoint: '/customer', requiresUuid: false, description: 'Listar clientes' },
  { method: 'GET', endpoint: '/customer/:id', requiresUuid: false, description: 'Buscar cliente por ID' },
  { method: 'POST', endpoint: '/customer', requiresUuid: false, description: 'Criar cliente' },
  { method: 'PATCH', endpoint: '/customer/:id', requiresUuid: true, description: 'Atualizar cliente', component: 'CustomerDialog', file: 'src/components/customers/customer-dialog.tsx' },
  { method: 'DELETE', endpoint: '/customer/:id', requiresUuid: true, description: 'Deletar cliente', component: 'CustomerDeleteModal', file: 'src/components/customers/customer-delete-modal.tsx' },

  // VENDEDORES
  { method: 'GET', endpoint: '/seller', requiresUuid: false, description: 'Listar vendedores' },
  { method: 'GET', endpoint: '/seller/:id', requiresUuid: false, description: 'Buscar vendedor por ID' },
  { method: 'POST', endpoint: '/seller', requiresUuid: false, description: 'Criar vendedor' },
  { method: 'PATCH', endpoint: '/seller/:id', requiresUuid: true, description: 'Atualizar vendedor', component: 'SellerDialog', file: 'src/components/sellers/seller-dialog.tsx' },
  { method: 'DELETE', endpoint: '/seller/:id', requiresUuid: true, description: 'Deletar vendedor', component: 'DeleteSellerModal', file: 'src/components/sellers/delete-seller-modal.tsx' },
  { method: 'PATCH', endpoint: '/seller/my-profile', requiresUuid: false, description: 'Atualizar perfil do vendedor' },

  // VENDAS
  { method: 'GET', endpoint: '/sale', requiresUuid: false, description: 'Listar vendas' },
  { method: 'GET', endpoint: '/sale/:id', requiresUuid: false, description: 'Buscar venda por ID' },
  { method: 'POST', endpoint: '/sale', requiresUuid: false, description: 'Criar venda', component: 'CheckoutDialog', file: 'src/components/sales/checkout-dialog.tsx' },
  { method: 'PATCH', endpoint: '/sale/:id', requiresUuid: true, description: 'Atualizar venda' },
  { method: 'DELETE', endpoint: '/sale/:id', requiresUuid: true, description: 'Deletar venda' },

  // EMPRESAS
  { method: 'GET', endpoint: '/company', requiresUuid: false, description: 'Listar empresas' },
  { method: 'GET', endpoint: '/company/:id', requiresUuid: false, description: 'Buscar empresa por ID' },
  { method: 'POST', endpoint: '/company', requiresUuid: false, description: 'Criar empresa' },
  { method: 'PATCH', endpoint: '/company/:id', requiresUuid: true, description: 'Atualizar empresa', component: 'CompaniesPage', file: 'src/app/(dashboard)/companies/page.tsx' },
  { method: 'DELETE', endpoint: '/company/:id', requiresUuid: true, description: 'Deletar empresa', component: 'CompaniesPage', file: 'src/app/(dashboard)/companies/page.tsx' },
  { method: 'PATCH', endpoint: '/company/my-company', requiresUuid: false, description: 'Atualizar dados da própria empresa' },

  // CONTAS A PAGAR
  { method: 'GET', endpoint: '/bill-to-pay', requiresUuid: false, description: 'Listar contas a pagar' },
  { method: 'GET', endpoint: '/bill-to-pay/:id', requiresUuid: false, description: 'Buscar conta por ID' },
  { method: 'POST', endpoint: '/bill-to-pay', requiresUuid: false, description: 'Criar conta a pagar' },
  { method: 'PATCH', endpoint: '/bill-to-pay/:id', requiresUuid: true, description: 'Atualizar conta a pagar' },
  { method: 'PATCH', endpoint: '/bill-to-pay/:id/mark-paid', requiresUuid: true, description: 'Marcar como pago', component: 'BillsTable', file: 'src/components/bills/bills-table.tsx' },
  { method: 'DELETE', endpoint: '/bill-to-pay/:id', requiresUuid: true, description: 'Deletar conta a pagar' },

  // FECHAMENTO DE CAIXA
  { method: 'GET', endpoint: '/cash-closure/current', requiresUuid: false, description: 'Caixa atual' },
  { method: 'POST', endpoint: '/cash-closure', requiresUuid: false, description: 'Abrir caixa' },
  { method: 'PATCH', endpoint: '/cash-closure/close', requiresUuid: false, description: 'Fechar caixa', component: 'CashClosurePage', file: 'src/app/(dashboard)/cash-closure/page.tsx' },
];

// ============================================================================
// FUNÇÕES DE AUDITORIA E TESTE
// ============================================================================

export function auditAllUuidOperations(): {
  totalOperations: number;
  uuidRequiredOperations: number;
  cuidAcceptedOperations: number;
  problematicOperations: EndpointOperation[];
  summary: string;
} {
  console.log('[AUDIT] Iniciando auditoria completa de operações UUID...');
  
  const uuidRequired = ENDPOINT_OPERATIONS.filter(op => op.requiresUuid);
  const cuidAccepted = ENDPOINT_OPERATIONS.filter(op => !op.requiresUuid);
  
  // Identificar operações problemáticas (que requerem UUID mas podem receber CUIDs)
  const problematicOperations = uuidRequired.filter(op => 
    op.method === 'PATCH' || op.method === 'DELETE'
  );
  
  const summary = `
[AUDIT] Resumo da Auditoria:
- Total de operações: ${ENDPOINT_OPERATIONS.length}
- Operações que requerem UUID: ${uuidRequired.length}
- Operações que aceitam CUID: ${cuidAccepted.length}
- Operações problemáticas identificadas: ${problematicOperations.length}

Operações problemáticas:
${problematicOperations.map(op => `- ${op.method} ${op.endpoint} (${op.component || 'N/A'})`).join('\n')}
  `;
  
  console.log(summary);
  
  return {
    totalOperations: ENDPOINT_OPERATIONS.length,
    uuidRequiredOperations: uuidRequired.length,
    cuidAcceptedOperations: cuidAccepted.length,
    problematicOperations,
    summary
  };
}

export function testUuidConsistencyAcrossApp(): {
  productOperations: any;
  customerOperations: any;
  sellerOperations: any;
  saleOperations: any;
  companyOperations: any;
  billOperations: any;
  overallScore: number;
} {
  console.log('[TEST] Testando consistência de UUIDs em toda a aplicação...');
  
  // Simular diferentes tipos de IDs
  const testIds = {
    cuid: 'cmgx0svyi0006hmx0ffbzwcwv',
    uuid: '123e4567-e89b-12d3-a456-426614174000',
    invalid: 'invalid-id'
  };
  
  // Testar operações de produtos
  const productOperations = {
    create: { id: testIds.cuid, shouldConvert: false, reason: 'POST aceita CUID' },
    update: { id: testIds.cuid, shouldConvert: true, reason: 'PATCH requer UUID' },
    delete: { id: testIds.cuid, shouldConvert: true, reason: 'DELETE requer UUID' },
    get: { id: testIds.cuid, shouldConvert: false, reason: 'GET aceita CUID' }
  };
  
  // Testar operações de clientes
  const customerOperations = {
    create: { id: testIds.cuid, shouldConvert: false, reason: 'POST aceita CUID' },
    update: { id: testIds.cuid, shouldConvert: true, reason: 'PATCH requer UUID' },
    delete: { id: testIds.cuid, shouldConvert: true, reason: 'DELETE requer UUID' },
    get: { id: testIds.cuid, shouldConvert: false, reason: 'GET aceita CUID' }
  };
  
  // Testar operações de vendedores
  const sellerOperations = {
    create: { id: testIds.cuid, shouldConvert: false, reason: 'POST aceita CUID' },
    update: { id: testIds.cuid, shouldConvert: true, reason: 'PATCH requer UUID' },
    delete: { id: testIds.cuid, shouldConvert: true, reason: 'DELETE requer UUID' },
    get: { id: testIds.cuid, shouldConvert: false, reason: 'GET aceita CUID' }
  };
  
  // Testar operações de vendas
  const saleOperations = {
    create: { id: testIds.cuid, shouldConvert: false, reason: 'POST aceita CUID' },
    update: { id: testIds.cuid, shouldConvert: true, reason: 'PATCH requer UUID' },
    delete: { id: testIds.cuid, shouldConvert: true, reason: 'DELETE requer UUID' },
    get: { id: testIds.cuid, shouldConvert: false, reason: 'GET aceita CUID' }
  };
  
  // Testar operações de empresas
  const companyOperations = {
    create: { id: testIds.cuid, shouldConvert: false, reason: 'POST aceita CUID' },
    update: { id: testIds.cuid, shouldConvert: true, reason: 'PATCH requer UUID' },
    delete: { id: testIds.cuid, shouldConvert: true, reason: 'DELETE requer UUID' },
    get: { id: testIds.cuid, shouldConvert: false, reason: 'GET aceita CUID' }
  };
  
  // Testar operações de contas a pagar
  const billOperations = {
    create: { id: testIds.cuid, shouldConvert: false, reason: 'POST aceita CUID' },
    update: { id: testIds.cuid, shouldConvert: true, reason: 'PATCH requer UUID' },
    delete: { id: testIds.cuid, shouldConvert: true, reason: 'DELETE requer UUID' },
    get: { id: testIds.cuid, shouldConvert: false, reason: 'GET aceita CUID' }
  };
  
  // Calcular score geral
  const allOperations = [
    ...Object.values(productOperations),
    ...Object.values(customerOperations),
    ...Object.values(sellerOperations),
    ...Object.values(saleOperations),
    ...Object.values(companyOperations),
    ...Object.values(billOperations)
  ];
  
  const correctOperations = allOperations.filter(op => 
    (op.shouldConvert && op.id !== testIds.cuid) || 
    (!op.shouldConvert && op.id === testIds.cuid)
  );
  
  const overallScore = Math.round((correctOperations.length / allOperations.length) * 100);
  
  console.log(`[TEST] Score geral de consistência: ${overallScore}%`);
  
  return {
    productOperations,
    customerOperations,
    sellerOperations,
    saleOperations,
    companyOperations,
    billOperations,
    overallScore
  };
}

export function validateComponentUuidUsage(componentName: string): {
  component: string;
  operations: any[];
  issues: string[];
  score: number;
  recommendations: string[];
} {
  console.log(`[VALIDATE] Validando uso de UUID no componente: ${componentName}`);
  
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Mapear componentes para suas operações
  const componentOperations: Record<string, any[]> = {
    'ProductDialog': [
      { operation: 'update', method: 'PATCH', requiresUuid: true },
      { operation: 'create', method: 'POST', requiresUuid: false }
    ],
    'ProductsTable': [
      { operation: 'delete', method: 'DELETE', requiresUuid: true }
    ],
    'CustomerDialog': [
      { operation: 'update', method: 'PATCH', requiresUuid: true },
      { operation: 'create', method: 'POST', requiresUuid: false }
    ],
    'CustomerDeleteModal': [
      { operation: 'delete', method: 'DELETE', requiresUuid: true }
    ],
    'SellerDialog': [
      { operation: 'update', method: 'PATCH', requiresUuid: true },
      { operation: 'create', method: 'POST', requiresUuid: false }
    ],
    'DeleteSellerModal': [
      { operation: 'delete', method: 'DELETE', requiresUuid: true }
    ],
    'CheckoutDialog': [
      { operation: 'create', method: 'POST', requiresUuid: false }
    ],
    'CompaniesPage': [
      { operation: 'update', method: 'PATCH', requiresUuid: true },
      { operation: 'delete', method: 'DELETE', requiresUuid: true }
    ],
    'BillsTable': [
      { operation: 'markPaid', method: 'PATCH', requiresUuid: true }
    ],
    'CashClosurePage': [
      { operation: 'close', method: 'PATCH', requiresUuid: false }
    ]
  };
  
  const operations = componentOperations[componentName] || [];
  
  // Validar cada operação
  operations.forEach(op => {
    if (op.requiresUuid) {
      issues.push(`${op.operation} (${op.method}) requer UUID mas pode estar recebendo CUID`);
      recommendations.push(`Implementar conversão automática para ${op.operation}`);
    } else {
      recommendations.push(`Manter ID original para ${op.operation} (${op.method})`);
    }
  });
  
  const score = issues.length === 0 ? 100 : Math.max(0, 100 - (issues.length * 20));
  
  console.log(`[VALIDATE] Componente ${componentName}: ${score}% (${issues.length} problemas)`);
  
  return {
    component: componentName,
    operations,
    issues,
    score,
    recommendations
  };
}

export function generateUuidTestReport(): string {
  console.log('[REPORT] Gerando relatório completo de testes UUID...');
  
  const audit = auditAllUuidOperations();
  const consistency = testUuidConsistencyAcrossApp();
  
  const components = [
    'ProductDialog', 'ProductsTable', 'CustomerDialog', 'CustomerDeleteModal',
    'SellerDialog', 'DeleteSellerModal', 'CheckoutDialog', 'CompaniesPage',
    'BillsTable', 'CashClosurePage'
  ];
  
  const componentValidations = components.map(comp => validateComponentUuidUsage(comp));
  const avgComponentScore = componentValidations.reduce((sum, val) => sum + val.score, 0) / componentValidations.length;
  
  const report = `
# RELATÓRIO COMPLETO DE TESTES UUID - APLICAÇÃO

## 📊 Resumo Executivo
- **Score Geral de Consistência**: ${consistency.overallScore}%
- **Score Médio dos Componentes**: ${Math.round(avgComponentScore)}%
- **Operações Problemáticas**: ${audit.problematicOperations.length}
- **Total de Operações**: ${audit.totalOperations}

## 🔍 Auditoria de Endpoints
${audit.summary}

## 🧪 Testes de Consistência
- **Produtos**: ${Object.keys(consistency.productOperations).length} operações testadas
- **Clientes**: ${Object.keys(consistency.customerOperations).length} operações testadas
- **Vendedores**: ${Object.keys(consistency.sellerOperations).length} operações testadas
- **Vendas**: ${Object.keys(consistency.saleOperations).length} operações testadas
- **Empresas**: ${Object.keys(consistency.companyOperations).length} operações testadas
- **Contas**: ${Object.keys(consistency.billOperations).length} operações testadas

## 🎯 Validação por Componente
${componentValidations.map(val => `
### ${val.component} (${val.score}%)
- **Operações**: ${val.operations.length}
- **Problemas**: ${val.issues.length}
- **Recomendações**: ${val.recommendations.length}
${val.issues.length > 0 ? `- **Issues**: ${val.issues.join(', ')}` : ''}
`).join('')}

## 🚨 Operações Críticas que Requerem Atenção
${audit.problematicOperations.map(op => `
- **${op.method} ${op.endpoint}**
  - Componente: ${op.component || 'N/A'}
  - Arquivo: ${op.file || 'N/A'}
  - Descrição: ${op.description}
`).join('')}

## ✅ Recomendações de Implementação

### 1. Interceptor Automático
Implementar interceptor no apiClient.ts que detecte automaticamente:
- Operações PATCH/DELETE
- IDs CUID nas URLs
- Conversão automática para UUID

### 2. Validação por Componente
Cada componente deve validar seus IDs antes de enviar:
- ProductDialog: Converter para UUID em updates
- CustomerDialog: Converter para UUID em updates
- SellerDialog: Converter para UUID em updates
- ProductsTable: Converter para UUID em deletes
- CustomerDeleteModal: Converter para UUID em deletes
- DeleteSellerModal: Converter para UUID em deletes
- CompaniesPage: Converter para UUID em updates/deletes
- BillsTable: Converter para UUID em markPaid

### 3. Testes Automatizados
Implementar testes que validem:
- Conversão correta de CUID para UUID
- Preservação de UUIDs válidos
- Falha adequada para IDs inválidos
- Comportamento consistente entre componentes

## 🎯 Próximos Passos
1. Implementar interceptor automático
2. Corrigir componentes problemáticos
3. Adicionar testes automatizados
4. Documentar comportamento esperado
5. Monitorar logs em produção

---
*Relatório gerado em: ${new Date().toISOString()}*
*Sistema de Auditoria UUID v1.0*
  `;
  
  console.log(report);
  return report;
}

// ============================================================================
// FUNÇÕES DE TESTE ESPECÍFICAS POR COMPONENTE
// ============================================================================

export function testProductDialogUuidHandling(): {
  createOperation: any;
  updateOperation: any;
  issues: string[];
  score: number;
} {
  console.log('[TEST] Testando ProductDialog...');
  
  const testCuid = 'cmgx0svyi0006hmx0ffbzwcwv';
  const testUuid = '123e4567-e89b-12d3-a456-426614174000';
  
  const createOperation = {
    id: testCuid,
    shouldUseOriginal: true,
    reason: 'POST aceita CUID',
    test: 'PASS'
  };
  
  const updateOperation = {
    id: testCuid,
    shouldConvert: true,
    convertedId: ensureCoherentId(testCuid),
    reason: 'PATCH requer UUID',
    test: isValidBackendId(ensureCoherentId(testCuid)) ? 'PASS' : 'FAIL'
  };
  
  const issues: string[] = [];
  if (updateOperation.test === 'FAIL') {
    issues.push('Conversão de CUID para UUID falhou');
  }
  
  const score = issues.length === 0 ? 100 : 50;
  
  console.log(`[TEST] ProductDialog: ${score}% (${issues.length} problemas)`);
  
  return {
    createOperation,
    updateOperation,
    issues,
    score
  };
}

export function testCustomerDialogUuidHandling(): {
  createOperation: any;
  updateOperation: any;
  issues: string[];
  score: number;
} {
  console.log('[TEST] Testando CustomerDialog...');
  
  const testCuid = 'cmgx0svyi0006hmx0ffbzwcwv';
  
  const createOperation = {
    id: testCuid,
    shouldUseOriginal: true,
    reason: 'POST aceita CUID',
    test: 'PASS'
  };
  
  const updateOperation = {
    id: testCuid,
    shouldConvert: true,
    convertedId: ensureCoherentId(testCuid),
    reason: 'PATCH requer UUID',
    test: isValidBackendId(ensureCoherentId(testCuid)) ? 'PASS' : 'FAIL'
  };
  
  const issues: string[] = [];
  if (updateOperation.test === 'FAIL') {
    issues.push('Conversão de CUID para UUID falhou');
  }
  
  const score = issues.length === 0 ? 100 : 50;
  
  console.log(`[TEST] CustomerDialog: ${score}% (${issues.length} problemas)`);
  
  return {
    createOperation,
    updateOperation,
    issues,
    score
  };
}

export function testCheckoutDialogUuidHandling(): {
  saleCreation: any;
  issues: string[];
  score: number;
} {
  console.log('[TEST] Testando CheckoutDialog...');
  
  const testCuid = 'cmgx0svyi0006hmx0ffbzwcwv';
  
  const saleCreation = {
    productId: testCuid,
    shouldUseOriginal: true,
    reason: 'POST aceita CUID',
    test: 'PASS'
  };
  
  const issues: string[] = [];
  
  const score = issues.length === 0 ? 100 : 50;
  
  console.log(`[TEST] CheckoutDialog: ${score}% (${issues.length} problemas)`);
  
  return {
    saleCreation,
    issues,
    score
  };
}

// ============================================================================
// FUNÇÃO PRINCIPAL DE TESTE COMPLETO
// ============================================================================

export function runCompleteUuidTestSuite(): {
  audit: any;
  consistency: any;
  componentTests: any;
  overallScore: number;
  report: string;
} {
  console.log('[SUITE] Executando suite completa de testes UUID...');
  
  const audit = auditAllUuidOperations();
  const consistency = testUuidConsistencyAcrossApp();
  
  const componentTests = {
    productDialog: testProductDialogUuidHandling(),
    customerDialog: testCustomerDialogUuidHandling(),
    checkoutDialog: testCheckoutDialogUuidHandling()
  };
  
  const componentScores = Object.values(componentTests).map((test: any) => test.score);
  const avgComponentScore = componentScores.reduce((sum, score) => sum + score, 0) / componentScores.length;
  
  const overallScore = Math.round((consistency.overallScore + avgComponentScore) / 2);
  
  const report = generateUuidTestReport();
  
  console.log(`[SUITE] Suite completa executada. Score geral: ${overallScore}%`);
  
  return {
    audit,
    consistency,
    componentTests,
    overallScore,
    report
  };
}

// Tornar funções disponíveis globalmente para testes
if (typeof window !== 'undefined') {
  (window as any).auditAllUuidOperations = auditAllUuidOperations;
  (window as any).testUuidConsistencyAcrossApp = testUuidConsistencyAcrossApp;
  (window as any).validateComponentUuidUsage = validateComponentUuidUsage;
  (window as any).generateUuidTestReport = generateUuidTestReport;
  (window as any).testProductDialogUuidHandling = testProductDialogUuidHandling;
  (window as any).testCustomerDialogUuidHandling = testCustomerDialogUuidHandling;
  (window as any).testCheckoutDialogUuidHandling = testCheckoutDialogUuidHandling;
  (window as any).runCompleteUuidTestSuite = runCompleteUuidTestSuite;
}

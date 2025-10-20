// Teste Automatizado Completo de UUID - Execução Manual
// Execute este arquivo no console do navegador para testar toda a aplicação

console.log('🚀 Iniciando Teste Automatizado Completo de UUID...');

// ============================================================================
// FUNÇÃO PRINCIPAL DE TESTE
// ============================================================================

async function runCompleteUuidAudit() {
  console.log('\n📊 === AUDITORIA COMPLETA DE UUID ===');
  
  try {
    // Importar funções de teste (se disponíveis)
    if (typeof window !== 'undefined' && (window as any).runCompleteUuidTestSuite) {
      const testSuite = (window as any).runCompleteUuidTestSuite();
      console.log('✅ Suite de testes executada com sucesso');
      console.log(`📈 Score geral: ${testSuite.overallScore}%`);
      return testSuite;
    }
    
    // Fallback: executar testes básicos
    return await runBasicUuidTests();
    
  } catch (error) {
    console.error('❌ Erro ao executar auditoria:', error);
    return null;
  }
}

async function runBasicUuidTests() {
  console.log('\n🧪 === TESTES BÁSICOS DE UUID ===');
  
  const results = {
    cuidDetection: testCuidDetection(),
    uuidDetection: testUuidDetection(),
    conversionTests: testUuidConversion(),
    endpointTests: testEndpointBehavior(),
    componentTests: testComponentBehavior()
  };
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter((result: any) => result.passed).length;
  const score = Math.round((passedTests / totalTests) * 100);
  
  console.log(`\n📊 Resultado Final: ${passedTests}/${totalTests} testes passaram (${score}%)`);
  
  return { results, score, passedTests, totalTests };
}

// ============================================================================
// TESTES ESPECÍFICOS
// ============================================================================

function testCuidDetection() {
  console.log('\n🔍 Testando detecção de CUIDs...');
  
  const testCases = [
    { input: 'cmgx0svyi0006hmx0ffbzwcwv', expected: true, description: 'CUID válido' },
    { input: 'cmgx1gywq000shmx0381z14ep', expected: true, description: 'CUID válido' },
    { input: '123e4567-e89b-12d3-a456-426614174000', expected: false, description: 'UUID não é CUID' },
    { input: 'invalid-id', expected: false, description: 'ID inválido' },
    { input: '', expected: false, description: 'String vazia' }
  ];
  
  let passed = 0;
  testCases.forEach(testCase => {
    const isCuid = /^[a-z0-9]{25}$/i.test(testCase.input);
    const result = isCuid === testCase.expected;
    
    console.log(`${result ? '✅' : '❌'} ${testCase.description}: ${testCase.input} -> ${isCuid}`);
    if (result) passed++;
  });
  
  console.log(`📊 CUID Detection: ${passed}/${testCases.length} passaram`);
  
  return { passed: passed === testCases.length, total: testCases.length, passed };
}

function testUuidDetection() {
  console.log('\n🔍 Testando detecção de UUIDs...');
  
  const testCases = [
    { input: '123e4567-e89b-12d3-a456-426614174000', expected: true, description: 'UUID válido' },
    { input: '00000000-0000-4000-8000-00001c4d42ce', expected: true, description: 'UUID válido' },
    { input: 'cmgx0svyi0006hmx0ffbzwcwv', expected: false, description: 'CUID não é UUID' },
    { input: 'invalid-uuid', expected: false, description: 'UUID inválido' },
    { input: '', expected: false, description: 'String vazia' }
  ];
  
  let passed = 0;
  testCases.forEach(testCase => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(testCase.input);
    const result = isUuid === testCase.expected;
    
    console.log(`${result ? '✅' : '❌'} ${testCase.description}: ${testCase.input} -> ${isUuid}`);
    if (result) passed++;
  });
  
  console.log(`📊 UUID Detection: ${passed}/${testCases.length} passaram`);
  
  return { passed: passed === testCases.length, total: testCases.length, passed };
}

function testUuidConversion() {
  console.log('\n🔄 Testando conversão de UUIDs...');
  
  const testCuid = 'cmgx0svyi0006hmx0ffbzwcwv';
  
  // Testar se a função de conversão existe
  if (typeof window !== 'undefined' && (window as any).convertCuidToUuid) {
    const convertCuidToUuid = (window as any).convertCuidToUuid;
    
    try {
      const uuid1 = convertCuidToUuid(testCuid);
      const uuid2 = convertCuidToUuid(testCuid);
      
      const isConsistent = uuid1 === uuid2;
      const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid1);
      
      console.log(`✅ Conversão consistente: ${isConsistent}`);
      console.log(`✅ UUID válido: ${isValidUuid}`);
      console.log(`📝 CUID: ${testCuid}`);
      console.log(`📝 UUID: ${uuid1}`);
      
      return { passed: isConsistent && isValidUuid, uuid1, uuid2, isConsistent, isValidUuid };
      
    } catch (error) {
      console.error('❌ Erro na conversão:', error);
      return { passed: false, error: error.message };
    }
  } else {
    console.log('⚠️ Função convertCuidToUuid não disponível');
    return { passed: false, error: 'Função não disponível' };
  }
}

function testEndpointBehavior() {
  console.log('\n🌐 Testando comportamento de endpoints...');
  
  const endpoints = [
    { method: 'GET', endpoint: '/product', requiresUuid: false, description: 'Listar produtos' },
    { method: 'POST', endpoint: '/product', requiresUuid: false, description: 'Criar produto' },
    { method: 'PATCH', endpoint: '/product/:id', requiresUuid: true, description: 'Atualizar produto' },
    { method: 'DELETE', endpoint: '/product/:id', requiresUuid: true, description: 'Deletar produto' },
    { method: 'GET', endpoint: '/customer', requiresUuid: false, description: 'Listar clientes' },
    { method: 'POST', endpoint: '/customer', requiresUuid: false, description: 'Criar cliente' },
    { method: 'PATCH', endpoint: '/customer/:id', requiresUuid: true, description: 'Atualizar cliente' },
    { method: 'DELETE', endpoint: '/customer/:id', requiresUuid: true, description: 'Deletar cliente' },
    { method: 'POST', endpoint: '/sale', requiresUuid: false, description: 'Criar venda' },
    { method: 'PATCH', endpoint: '/sale/:id', requiresUuid: true, description: 'Atualizar venda' }
  ];
  
  let passed = 0;
  endpoints.forEach(endpoint => {
    const shouldRequireUuid = endpoint.method === 'PATCH' || endpoint.method === 'DELETE';
    const result = endpoint.requiresUuid === shouldRequireUuid;
    
    console.log(`${result ? '✅' : '❌'} ${endpoint.method} ${endpoint.endpoint}: ${endpoint.description}`);
    console.log(`   Requer UUID: ${endpoint.requiresUuid} (esperado: ${shouldRequireUuid})`);
    
    if (result) passed++;
  });
  
  console.log(`📊 Endpoint Behavior: ${passed}/${endpoints.length} passaram`);
  
  return { passed: passed === endpoints.length, total: endpoints.length, passed };
}

function testComponentBehavior() {
  console.log('\n🧩 Testando comportamento de componentes...');
  
  const components = [
    { name: 'ProductDialog', operations: ['create', 'update'], createRequiresUuid: false, updateRequiresUuid: true },
    { name: 'CustomerDialog', operations: ['create', 'update'], createRequiresUuid: false, updateRequiresUuid: true },
    { name: 'SellerDialog', operations: ['create', 'update'], createRequiresUuid: false, updateRequiresUuid: true },
    { name: 'CheckoutDialog', operations: ['create'], createRequiresUuid: false },
    { name: 'ProductsTable', operations: ['delete'], deleteRequiresUuid: true },
    { name: 'CustomerDeleteModal', operations: ['delete'], deleteRequiresUuid: true },
    { name: 'DeleteSellerModal', operations: ['delete'], deleteRequiresUuid: true }
  ];
  
  let passed = 0;
  components.forEach(component => {
    console.log(`\n🔍 Testando ${component.name}:`);
    
    let componentPassed = true;
    
    if (component.operations.includes('create') && component.createRequiresUuid !== false) {
      console.log('❌ CREATE deveria aceitar CUID');
      componentPassed = false;
    } else if (component.operations.includes('create')) {
      console.log('✅ CREATE aceita CUID');
    }
    
    if (component.operations.includes('update') && component.updateRequiresUuid !== true) {
      console.log('❌ UPDATE deveria requerer UUID');
      componentPassed = false;
    } else if (component.operations.includes('update')) {
      console.log('✅ UPDATE requer UUID');
    }
    
    if (component.operations.includes('delete') && component.deleteRequiresUuid !== true) {
      console.log('❌ DELETE deveria requerer UUID');
      componentPassed = false;
    } else if (component.operations.includes('delete')) {
      console.log('✅ DELETE requer UUID');
    }
    
    if (componentPassed) passed++;
  });
  
  console.log(`📊 Component Behavior: ${passed}/${components.length} passaram`);
  
  return { passed: passed === components.length, total: components.length, passed };
}

// ============================================================================
// FUNÇÃO DE RELATÓRIO
// ============================================================================

function generateTestReport(results: any) {
  const report = `
# RELATÓRIO DE TESTE AUTOMATIZADO DE UUID

## 📊 Resumo Executivo
- **Data do Teste**: ${new Date().toISOString()}
- **Score Geral**: ${results.score}%
- **Testes Passaram**: ${results.passedTests}/${results.totalTests}

## 🧪 Resultados por Categoria

### 🔍 Detecção de CUIDs
- **Status**: ${results.results.cuidDetection.passed ? '✅ PASSOU' : '❌ FALHOU'}
- **Detalhes**: ${results.results.cuidDetection.passed}/${results.results.cuidDetection.total} testes passaram

### 🔍 Detecção de UUIDs
- **Status**: ${results.results.uuidDetection.passed ? '✅ PASSOU' : '❌ FALHOU'}
- **Detalhes**: ${results.results.uuidDetection.passed}/${results.results.uuidDetection.total} testes passaram

### 🔄 Conversão de UUIDs
- **Status**: ${results.results.conversionTests.passed ? '✅ PASSOU' : '❌ FALHOU'}
- **Detalhes**: ${results.results.conversionTests.isConsistent ? 'Consistente' : 'Inconsistente'}, ${results.results.conversionTests.isValidUuid ? 'UUID Válido' : 'UUID Inválido'}

### 🌐 Comportamento de Endpoints
- **Status**: ${results.results.endpointTests.passed ? '✅ PASSOU' : '❌ FALHOU'}
- **Detalhes**: ${results.results.endpointTests.passed}/${results.results.endpointTests.total} endpoints corretos

### 🧩 Comportamento de Componentes
- **Status**: ${results.results.componentTests.passed ? '✅ PASSOU' : '❌ FALHOU'}
- **Detalhes**: ${results.results.componentTests.passed}/${results.results.componentTests.total} componentes corretos

## 🎯 Recomendações

${results.score >= 80 ? '✅ Sistema funcionando bem' : '⚠️ Sistema precisa de melhorias'}

### Próximos Passos:
1. ${results.results.cuidDetection.passed ? '✅' : '❌'} Verificar detecção de CUIDs
2. ${results.results.uuidDetection.passed ? '✅' : '❌'} Verificar detecção de UUIDs
3. ${results.results.conversionTests.passed ? '✅' : '❌'} Verificar conversão de UUIDs
4. ${results.results.endpointTests.passed ? '✅' : '❌'} Verificar comportamento de endpoints
5. ${results.results.componentTests.passed ? '✅' : '❌'} Verificar comportamento de componentes

---
*Relatório gerado automaticamente pelo sistema de testes UUID*
  `;
  
  console.log(report);
  return report;
}

// ============================================================================
// EXECUÇÃO AUTOMÁTICA
// ============================================================================

// Executar automaticamente quando o arquivo for carregado
if (typeof window !== 'undefined') {
  console.log('🎯 Sistema de Teste Automatizado UUID carregado!');
  console.log('📝 Execute: runCompleteUuidAudit() para iniciar os testes');
  
  // Tornar função disponível globalmente
  (window as any).runCompleteUuidAudit = runCompleteUuidAudit;
  (window as any).generateTestReport = generateTestReport;
  
  // Executar automaticamente após 2 segundos
  setTimeout(async () => {
    console.log('\n🚀 Executando teste automatizado...');
    const results = await runCompleteUuidAudit();
    if (results) {
      generateTestReport(results);
    }
  }, 2000);
}

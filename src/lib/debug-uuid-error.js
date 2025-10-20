// Teste Específico para Debug do Erro "items.0.productId must be a UUID"
// Execute este código no console do navegador para identificar exatamente onde está o problema

console.log('🔍 === DEBUG ESPECÍFICO: items.0.productId must be a UUID ===');

// Função para testar diferentes cenários de productId
function testProductIdScenarios() {
  console.log('\n🧪 Testando diferentes cenários de productId...');
  
  const testCases = [
    {
      name: 'CUID válido',
      productId: 'cmgx0svyi0006hmx0ffbzwcwv',
      expectedBehavior: 'Aceito pelo backend'
    },
    {
      name: 'UUID válido',
      productId: '123e4567-e89b-12d3-a456-426614174000',
      expectedBehavior: 'Aceito pelo backend'
    },
    {
      name: 'ID inválido',
      productId: 'invalid-id',
      expectedBehavior: 'Rejeitado pelo backend'
    },
    {
      name: 'String vazia',
      productId: '',
      expectedBehavior: 'Rejeitado pelo backend'
    },
    {
      name: 'Null',
      productId: null,
      expectedBehavior: 'Rejeitado pelo backend'
    },
    {
      name: 'Undefined',
      productId: undefined,
      expectedBehavior: 'Rejeitado pelo backend'
    }
  ];
  
  testCases.forEach(testCase => {
    console.log(`\n📝 Teste: ${testCase.name}`);
    console.log(`   ProductId: ${testCase.productId}`);
    console.log(`   Tipo: ${typeof testCase.productId}`);
    console.log(`   É CUID: ${/^[a-z0-9]{25}$/i.test(testCase.productId)}`);
    console.log(`   É UUID: ${/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(testCase.productId)}`);
    console.log(`   Comportamento esperado: ${testCase.expectedBehavior}`);
  });
}

// Função para simular dados de venda
function simulateSaleData() {
  console.log('\n🛒 Simulando dados de venda...');
  
  // Simular produtos do carrinho
  const mockProducts = [
    { id: 'cmgx0svyi0006hmx0ffbzwcwv', name: 'Produto CUID', price: 10.00 },
    { id: '123e4567-e89b-12d3-a456-426614174000', name: 'Produto UUID', price: 20.00 },
    { id: 'invalid-id', name: 'Produto Inválido', price: 30.00 }
  ];
  
  const mockItems = mockProducts.map(product => ({
    product: product,
    quantity: 1
  }));
  
  console.log('📦 Produtos no carrinho:');
  mockItems.forEach((item, index) => {
    console.log(`   ${index + 1}. ${item.product.name}`);
    console.log(`      ID: ${item.product.id}`);
    console.log(`      Tipo: ${typeof item.product.id}`);
    console.log(`      É CUID: ${/^[a-z0-9]{25}$/i.test(item.product.id)}`);
    console.log(`      É UUID: ${/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.product.id)}`);
  });
  
  // Simular dados de venda como no CheckoutDialog
  const saleData = {
    items: mockItems.map((item) => {
      console.log(`[DEBUG] Processando item: ${item.product.name}`);
      console.log(`[DEBUG] ProductId original: ${item.product.id}`);
      
      return {
        productId: item.product.id, // Manter ID original
        quantity: item.quantity,
      };
    }),
    paymentMethods: [{ method: 'pix', amount: 30.00 }],
    clientName: 'Cliente Teste',
    clientCpfCnpj: '123.456.789-00'
  };
  
  console.log('\n📋 Dados de venda simulados:');
  console.log(JSON.stringify(saleData, null, 2));
  
  return saleData;
}

// Função para testar validação do backend
async function testBackendValidation() {
  console.log('\n🌐 Testando validação do backend...');
  
  try {
    // Simular chamada para o backend
    const saleData = simulateSaleData();
    
    console.log('\n📤 Enviando dados para o backend...');
    console.log('URL: POST /sale');
    console.log('Body:', JSON.stringify(saleData, null, 2));
    
    // Verificar se há algum problema com os IDs
    const problematicItems = saleData.items.filter(item => {
      const isCuid = /^[a-z0-9]{25}$/i.test(item.productId);
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.productId);
      return !isCuid && !isUuid;
    });
    
    if (problematicItems.length > 0) {
      console.log('❌ PROBLEMA ENCONTRADO:');
      problematicItems.forEach((item, index) => {
        console.log(`   Item ${index + 1}: productId = "${item.productId}"`);
        console.log(`   Tipo: ${typeof item.productId}`);
        console.log(`   Comprimento: ${item.productId?.length || 'N/A'}`);
      });
    } else {
      console.log('✅ Todos os productIds parecem válidos');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar validação:', error);
  }
}

// Função para verificar se o interceptor está funcionando
function testInterceptorBehavior() {
  console.log('\n🔧 Testando comportamento do interceptor...');
  
  const testUrls = [
    '/product/cmgx0svyi0006hmx0ffbzwcwv',
    '/customer/cmgx0svyi0006hmx0ffbzwcwv',
    '/sale/cmgx0svyi0006hmx0ffbzwcwv'
  ];
  
  const testMethods = ['patch', 'delete'];
  
  testMethods.forEach(method => {
    console.log(`\n📝 Testando método: ${method.toUpperCase()}`);
    
    testUrls.forEach(url => {
      console.log(`   URL: ${method.toUpperCase()} ${url}`);
      
      // Simular detecção de CUID
      const urlMatch = url.match(/\/([a-z0-9]{25})\/?$/i);
      if (urlMatch) {
        const cuidId = urlMatch[1];
        console.log(`   ✅ CUID detectado: ${cuidId}`);
        console.log(`   🔄 Seria convertido para UUID`);
      } else {
        console.log(`   ❌ Nenhum CUID detectado`);
      }
    });
  });
}

// Função para verificar se há algum problema específico com vendas
function checkSaleSpecificIssues() {
  console.log('\n🛒 Verificando problemas específicos com vendas...');
  
  // Verificar se há alguma validação específica para vendas
  console.log('📋 Campos obrigatórios para vendas:');
  console.log('   - items: array de objetos');
  console.log('   - items[].productId: string (deve ser UUID válido)');
  console.log('   - items[].quantity: number');
  
  // Verificar se há alguma diferença entre criação e atualização
  console.log('\n🔄 Diferenças entre operações:');
  console.log('   POST /sale: Deveria aceitar CUIDs');
  console.log('   PATCH /sale/:id: Deveria exigir UUIDs');
  console.log('   DELETE /sale/:id: Deveria exigir UUIDs');
  
  // Verificar se há alguma validação adicional
  console.log('\n⚠️ Possíveis causas do erro:');
  console.log('   1. Backend mudou validação para exigir UUIDs em POST');
  console.log('   2. Há alguma validação adicional no schema');
  console.log('   3. Interceptor não está funcionando corretamente');
  console.log('   4. Há algum middleware que converte IDs');
}

// Função principal de debug
function runCompleteDebug() {
  console.log('🚀 Iniciando debug completo...');
  
  testProductIdScenarios();
  simulateSaleData();
  testBackendValidation();
  testInterceptorBehavior();
  checkSaleSpecificIssues();
  
  console.log('\n📊 === RESUMO DO DEBUG ===');
  console.log('✅ Testes executados com sucesso');
  console.log('📝 Verifique os logs acima para identificar problemas');
  console.log('🔍 Se o erro persistir, pode ser necessário:');
  console.log('   1. Verificar se o backend mudou validação');
  console.log('   2. Implementar conversão forçada para vendas');
  console.log('   3. Adicionar logs mais detalhados');
}

// Executar automaticamente
runCompleteDebug();

// Tornar funções disponíveis globalmente
if (typeof window !== 'undefined') {
  (window as any).testProductIdScenarios = testProductIdScenarios;
  (window as any).simulateSaleData = simulateSaleData;
  (window as any).testBackendValidation = testBackendValidation;
  (window as any).testInterceptorBehavior = testInterceptorBehavior;
  (window as any).checkSaleSpecificIssues = checkSaleSpecificIssues;
  (window as any).runCompleteDebug = runCompleteDebug;
}

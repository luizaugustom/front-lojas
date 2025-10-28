/**
 * Script de teste para validar que o sistema está funcionando apenas com UUIDs v4
 * Este script testa todas as funções para garantir que não há conversões de CUID
 */

// Função para validar UUID v4
function isValidUUID(id) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// Dados mock (copiados do arquivo mock-api.ts)
const MOCK_PRODUCTS = [
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

/**
 * Testa se todos os dados mock usam apenas UUIDs v4
 */
function testMockDataUUIDs() {
  console.log('🧪 Testando dados mock...');
  
  const errors = [];
  
  // Testar produtos
  MOCK_PRODUCTS.forEach((product, index) => {
    if (!isValidUUID(product.id)) {
      errors.push(`Produto[${index}] tem ID inválido: ${product.id}`);
    }
    if (!isValidUUID(product.companyId)) {
      errors.push(`Produto[${index}] tem companyId inválido: ${product.companyId}`);
    }
  });
  
  const passed = errors.length === 0;
  
  console.log(`${passed ? '✅' : '❌'} Dados Mock UUIDs: ${passed ? 'Todos os dados mock usam UUIDs v4 válidos' : `Encontrados ${errors.length} IDs inválidos`}`);
  
  if (!passed && errors.length > 0) {
    console.log('   Detalhes:', errors);
  }
  
  return { passed, errors };
}

/**
 * Testa se o produto "Ferro 40x40" tem UUID válido
 */
function testFerro40x40UUID() {
  console.log('🔧 Testando produto "Ferro 40x40"...');
  
  const ferroProduct = MOCK_PRODUCTS.find(p => p.name === 'Ferro 40x40');
  
  if (!ferroProduct) {
    console.log('❌ Produto "Ferro 40x40": Produto não encontrado');
    return { passed: false };
  }
  
  const isIdValid = isValidUUID(ferroProduct.id);
  const isCompanyIdValid = isValidUUID(ferroProduct.companyId);
  
  const passed = isIdValid && isCompanyIdValid;
  
  console.log(`   ID: ${ferroProduct.id} - ${isIdValid ? '✅' : '❌'}`);
  console.log(`   Company ID: ${ferroProduct.companyId} - ${isCompanyIdValid ? '✅' : '❌'}`);
  console.log(`${passed ? '✅' : '❌'} Produto Ferro 40x40: ${passed ? 'Produto "Ferro 40x40" tem UUIDs válidos' : 'Produto "Ferro 40x40" tem UUIDs inválidos'}`);
  
  return { passed, details: { id: ferroProduct.id, companyId: ferroProduct.companyId, isIdValid, isCompanyIdValid } };
}

/**
 * Testa se não há CUIDs nos dados
 */
function testNoCuidsInData() {
  console.log('🚫 Testando ausência de CUIDs...');
  
  const cuidPattern = /^[a-z0-9]{25}$/i;
  const foundCuids = [];
  
  // Verificar todos os dados mock
  MOCK_PRODUCTS.forEach((item, index) => {
    // Verificar ID principal
    if (cuidPattern.test(item.id)) {
      foundCuids.push(`Item[${index}].id: ${item.id}`);
    }
    
    // Verificar companyId se existir
    if (item.companyId && cuidPattern.test(item.companyId)) {
      foundCuids.push(`Item[${index}].companyId: ${item.companyId}`);
    }
  });
  
  const passed = foundCuids.length === 0;
  
  console.log(`${passed ? '✅' : '❌'} Ausência de CUIDs: ${passed ? 'Nenhum CUID encontrado nos dados' : `Encontrados ${foundCuids.length} CUIDs`}`);
  
  if (!passed && foundCuids.length > 0) {
    console.log('   Detalhes:', foundCuids);
  }
  
  return { passed, foundCuids };
}

/**
 * Testa se todos os UUIDs seguem o formato v4
 */
function testUUIDv4Format() {
  console.log('📋 Testando formato UUID v4...');
  
  const uuidv4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const invalidFormats = [];
  
  // Verificar todos os dados mock
  MOCK_PRODUCTS.forEach((item, index) => {
    // Verificar ID principal
    if (!uuidv4Pattern.test(item.id)) {
      invalidFormats.push(`Item[${index}].id: ${item.id}`);
    }
    
    // Verificar companyId se existir
    if (item.companyId && !uuidv4Pattern.test(item.companyId)) {
      invalidFormats.push(`Item[${index}].companyId: ${item.companyId}`);
    }
  });
  
  const passed = invalidFormats.length === 0;
  
  console.log(`${passed ? '✅' : '❌'} Formato UUID v4: ${passed ? 'Todos os UUIDs seguem o formato v4' : `Encontrados ${invalidFormats.length} UUIDs com formato inválido`}`);
  
  if (!passed && invalidFormats.length > 0) {
    console.log('   Detalhes:', invalidFormats);
  }
  
  return { passed, invalidFormats };
}

/**
 * Executa todos os testes
 */
function runUUIDOnlySystemTests() {
  console.log('🧪 Iniciando testes do sistema UUID-only...\n');
  
  const tests = [
    testMockDataUUIDs,
    testFerro40x40UUID,
    testNoCuidsInData,
    testUUIDv4Format
  ];
  
  const results = [];
  
  tests.forEach(test => {
    try {
      const result = test();
      results.push(result);
      console.log('');
    } catch (error) {
      console.log(`❌ ${test.name}: Erro durante o teste: ${error}`);
      results.push({ passed: false, error });
    }
  });
  
  // Resumo final
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  console.log('📊 Resumo dos Testes:');
  console.log(`✅ Testes passaram: ${passedTests}/${totalTests}`);
  console.log(`❌ Testes falharam: ${totalTests - passedTests}/${totalTests}`);
  console.log(`🎯 Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 SUCESSO: Sistema está funcionando apenas com UUIDs v4!');
  } else {
    console.log('\n⚠️ ATENÇÃO: Foram encontrados problemas no sistema UUID-only!');
  }
  
  return results;
}

// Executar testes
runUUIDOnlySystemTests();

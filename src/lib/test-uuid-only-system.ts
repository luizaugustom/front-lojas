/**
 * Script de teste para validar que o sistema está funcionando apenas com UUIDs v4
 * Este script testa todas as funções para garantir que não há conversões de CUID
 */

import { isValidUUID } from './uuid-validator';
import { MOCK_PRODUCTS, MOCK_CUSTOMERS, MOCK_SELLERS, MOCK_SALES, MOCK_BILLS, MOCK_CASH_CLOSURES, MOCK_USERS } from './mock-api';

interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: any;
}

/**
 * Testa se todos os dados mock usam apenas UUIDs v4
 */
function testMockDataUUIDs(): TestResult {
  console.log('🧪 Testando dados mock...');
  
  const errors: string[] = [];
  
  // Testar produtos
  MOCK_PRODUCTS.forEach((product, index) => {
    if (!isValidUUID(product.id)) {
      errors.push(`Produto[${index}] tem ID inválido: ${product.id}`);
    }
    if (!isValidUUID(product.companyId)) {
      errors.push(`Produto[${index}] tem companyId inválido: ${product.companyId}`);
    }
  });
  
  // Testar clientes
  MOCK_CUSTOMERS.forEach((customer, index) => {
    if (!isValidUUID(customer.id)) {
      errors.push(`Cliente[${index}] tem ID inválido: ${customer.id}`);
    }
    if (!isValidUUID(customer.companyId)) {
      errors.push(`Cliente[${index}] tem companyId inválido: ${customer.companyId}`);
    }
  });
  
  // Testar vendedores
  MOCK_SELLERS.forEach((seller, index) => {
    if (!isValidUUID(seller.id)) {
      errors.push(`Vendedor[${index}] tem ID inválido: ${seller.id}`);
    }
    if (!isValidUUID(seller.companyId)) {
      errors.push(`Vendedor[${index}] tem companyId inválido: ${seller.companyId}`);
    }
  });
  
  // Testar vendas
  MOCK_SALES.forEach((sale, index) => {
    if (!isValidUUID(sale.id)) {
      errors.push(`Venda[${index}] tem ID inválido: ${sale.id}`);
    }
    if (!isValidUUID(sale.companyId)) {
      errors.push(`Venda[${index}] tem companyId inválido: ${sale.companyId}`);
    }
    if (!isValidUUID(sale.customerId)) {
      errors.push(`Venda[${index}] tem customerId inválido: ${sale.customerId}`);
    }
    if (!isValidUUID(sale.sellerId)) {
      errors.push(`Venda[${index}] tem sellerId inválido: ${sale.sellerId}`);
    }
    if (!isValidUUID(sale.cashClosureId)) {
      errors.push(`Venda[${index}] tem cashClosureId inválido: ${sale.cashClosureId}`);
    }
    
    // Testar items da venda
    sale.items.forEach((item, itemIndex) => {
      if (!isValidUUID(item.productId)) {
        errors.push(`Venda[${index}].items[${itemIndex}] tem productId inválido: ${item.productId}`);
      }
    });
  });
  
  // Testar contas a pagar
  MOCK_BILLS.forEach((bill, index) => {
    if (!isValidUUID(bill.id)) {
      errors.push(`Conta[${index}] tem ID inválido: ${bill.id}`);
    }
    if (!isValidUUID(bill.companyId)) {
      errors.push(`Conta[${index}] tem companyId inválido: ${bill.companyId}`);
    }
  });
  
  // Testar fechamentos de caixa
  MOCK_CASH_CLOSURES.forEach((closure, index) => {
    if (!isValidUUID(closure.id)) {
      errors.push(`Fechamento[${index}] tem ID inválido: ${closure.id}`);
    }
    if (!isValidUUID(closure.companyId)) {
      errors.push(`Fechamento[${index}] tem companyId inválido: ${closure.companyId}`);
    }
    if (!isValidUUID(closure.sellerId)) {
      errors.push(`Fechamento[${index}] tem sellerId inválido: ${closure.sellerId}`);
    }
  });
  
  // Testar usuários
  Object.values(MOCK_USERS).forEach((user, index) => {
    if (!isValidUUID(user.user.id)) {
      errors.push(`Usuário[${index}] tem ID inválido: ${user.user.id}`);
    }
    if ('companyId' in user.user && user.user.companyId && !isValidUUID(user.user.companyId)) {
      errors.push(`Usuário[${index}] tem companyId inválido: ${user.user.companyId}`);
    }
  });
  
  const passed = errors.length === 0;
  
  return {
    testName: 'Dados Mock UUIDs',
    passed,
    message: passed ? 'Todos os dados mock usam UUIDs v4 válidos' : `Encontrados ${errors.length} IDs inválidos`,
    details: errors
  };
}

/**
 * Testa se o produto "Ferro 40x40" tem UUID válido
 */
function testFerro40x40UUID(): TestResult {
  console.log('🔧 Testando produto "Ferro 40x40"...');
  
  const ferroProduct = MOCK_PRODUCTS.find(p => p.name === 'Ferro 40x40');
  
  if (!ferroProduct) {
    return {
      testName: 'Produto Ferro 40x40',
      passed: false,
      message: 'Produto "Ferro 40x40" não encontrado'
    };
  }
  
  const isIdValid = isValidUUID(ferroProduct.id);
  const isCompanyIdValid = isValidUUID(ferroProduct.companyId);
  
  const passed = isIdValid && isCompanyIdValid;
  
  return {
    testName: 'Produto Ferro 40x40',
    passed,
    message: passed ? 'Produto "Ferro 40x40" tem UUIDs válidos' : 'Produto "Ferro 40x40" tem UUIDs inválidos',
    details: {
      id: ferroProduct.id,
      companyId: ferroProduct.companyId,
      isIdValid,
      isCompanyIdValid
    }
  };
}

/**
 * Testa se não há CUIDs nos dados
 */
function testNoCuidsInData(): TestResult {
  console.log('🚫 Testando ausência de CUIDs...');
  
  const cuidPattern = /^[a-z0-9]{25}$/i;
  const foundCuids: string[] = [];
  
  // Verificar todos os dados mock
  const allData = [
    ...MOCK_PRODUCTS,
    ...MOCK_CUSTOMERS,
    ...MOCK_SELLERS,
    ...MOCK_SALES,
    ...MOCK_BILLS,
    ...MOCK_CASH_CLOSURES,
    ...Object.values(MOCK_USERS).map(u => u.user)
  ];
  
  allData.forEach((item, index) => {
    // Verificar ID principal
    if (cuidPattern.test(item.id)) {
      foundCuids.push(`Item[${index}].id: ${item.id}`);
    }
    
    // Verificar companyId se existir
    if ('companyId' in item && item.companyId && cuidPattern.test(item.companyId)) {
      foundCuids.push(`Item[${index}].companyId: ${item.companyId}`);
    }
    
    // Verificar outros IDs se existirem
    if ('customerId' in item && item.customerId && cuidPattern.test(item.customerId)) {
      foundCuids.push(`Item[${index}].customerId: ${item.customerId}`);
    }
    
    if ('sellerId' in item && item.sellerId && cuidPattern.test(item.sellerId)) {
      foundCuids.push(`Item[${index}].sellerId: ${item.sellerId}`);
    }
    
    if ('cashClosureId' in item && item.cashClosureId && cuidPattern.test(item.cashClosureId)) {
      foundCuids.push(`Item[${index}].cashClosureId: ${item.cashClosureId}`);
    }
    
    // Verificar items se existirem
    if ('items' in item && Array.isArray(item.items)) {
      item.items.forEach((subItem: any, subIndex: number) => {
        if (subItem.productId && cuidPattern.test(subItem.productId)) {
          foundCuids.push(`Item[${index}].items[${subIndex}].productId: ${subItem.productId}`);
        }
      });
    }
  });
  
  const passed = foundCuids.length === 0;
  
  return {
    testName: 'Ausência de CUIDs',
    passed,
    message: passed ? 'Nenhum CUID encontrado nos dados' : `Encontrados ${foundCuids.length} CUIDs`,
    details: foundCuids
  };
}

/**
 * Testa se todos os UUIDs seguem o formato v4
 */
function testUUIDv4Format(): TestResult {
  console.log('📋 Testando formato UUID v4...');
  
  const uuidv4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const invalidFormats: string[] = [];
  
  // Verificar todos os dados mock
  const allData = [
    ...MOCK_PRODUCTS,
    ...MOCK_CUSTOMERS,
    ...MOCK_SELLERS,
    ...MOCK_SALES,
    ...MOCK_BILLS,
    ...MOCK_CASH_CLOSURES,
    ...Object.values(MOCK_USERS).map(u => u.user)
  ];
  
  allData.forEach((item, index) => {
    // Verificar ID principal
    if (!uuidv4Pattern.test(item.id)) {
      invalidFormats.push(`Item[${index}].id: ${item.id}`);
    }
    
    // Verificar companyId se existir
    if ('companyId' in item && item.companyId && !uuidv4Pattern.test(item.companyId)) {
      invalidFormats.push(`Item[${index}].companyId: ${item.companyId}`);
    }
    
    // Verificar outros IDs se existirem
    if ('customerId' in item && item.customerId && !uuidv4Pattern.test(item.customerId)) {
      invalidFormats.push(`Item[${index}].customerId: ${item.customerId}`);
    }
    
    if ('sellerId' in item && item.sellerId && !uuidv4Pattern.test(item.sellerId)) {
      invalidFormats.push(`Item[${index}].sellerId: ${item.sellerId}`);
    }
    
    if ('cashClosureId' in item && item.cashClosureId && !uuidv4Pattern.test(item.cashClosureId)) {
      invalidFormats.push(`Item[${index}].cashClosureId: ${item.cashClosureId}`);
    }
    
    // Verificar items se existirem
    if ('items' in item && Array.isArray(item.items)) {
      item.items.forEach((subItem: any, subIndex: number) => {
        if (subItem.productId && !uuidv4Pattern.test(subItem.productId)) {
          invalidFormats.push(`Item[${index}].items[${subIndex}].productId: ${subItem.productId}`);
        }
      });
    }
  });
  
  const passed = invalidFormats.length === 0;
  
  return {
    testName: 'Formato UUID v4',
    passed,
    message: passed ? 'Todos os UUIDs seguem o formato v4' : `Encontrados ${invalidFormats.length} UUIDs com formato inválido`,
    details: invalidFormats
  };
}

/**
 * Executa todos os testes
 */
export function runUUIDOnlySystemTests(): TestResult[] {
  console.log('🧪 Iniciando testes do sistema UUID-only...\n');
  
  const tests = [
    testMockDataUUIDs,
    testFerro40x40UUID,
    testNoCuidsInData,
    testUUIDv4Format
  ];
  
  const results: TestResult[] = [];
  
  tests.forEach(test => {
    try {
      const result = test();
      results.push(result);
      
      console.log(`${result.passed ? '✅' : '❌'} ${result.testName}: ${result.message}`);
      
      if (!result.passed && result.details) {
        console.log('   Detalhes:', result.details);
      }
      
      console.log('');
    } catch (error) {
      results.push({
        testName: test.name,
        passed: false,
        message: `Erro durante o teste: ${error}`,
        details: error
      });
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

// Executar automaticamente se este arquivo for executado diretamente
if (require.main === module) {
  runUUIDOnlySystemTests();
}

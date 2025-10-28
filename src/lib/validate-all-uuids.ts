/**
 * Script para validar que todos os UUIDs na aplicação estão no formato correto (UUID v4)
 * Este script verifica todos os dados mock e garante consistência
 */

import { isValidUUID } from './uuid-validator';
import { MOCK_PRODUCTS, MOCK_CUSTOMERS, MOCK_SELLERS, MOCK_SALES, MOCK_BILLS, MOCK_CASH_CLOSURES, MOCK_USERS } from './mock-api';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  summary: {
    totalIds: number;
    validIds: number;
    invalidIds: number;
  };
}

/**
 * Valida todos os IDs em um array de objetos
 */
function validateIdsInArray<T extends Record<string, any>>(
  items: T[], 
  itemType: string
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  items.forEach((item, index) => {
    // Validar ID principal
    if (item.id && !isValidUUID(item.id)) {
      errors.push(`${itemType}[${index}]: ID inválido "${item.id}"`);
    }
    
    // Validar companyId se existir
    if (item.companyId && !isValidUUID(item.companyId)) {
      errors.push(`${itemType}[${index}]: companyId inválido "${item.companyId}"`);
    }
    
    // Validar outros IDs relacionados
    if (item.customerId && !isValidUUID(item.customerId)) {
      errors.push(`${itemType}[${index}]: customerId inválido "${item.customerId}"`);
    }
    
    if (item.sellerId && !isValidUUID(item.sellerId)) {
      errors.push(`${itemType}[${index}]: sellerId inválido "${item.sellerId}"`);
    }
    
    if (item.cashClosureId && !isValidUUID(item.cashClosureId)) {
      errors.push(`${itemType}[${index}]: cashClosureId currentClosure inválido "${item.cashClosureId}"`);
    }
    
    // Validar IDs em arrays (como items em vendas)
    if (Array.isArray(item.items)) {
      item.items.forEach((subItem: any, subIndex: number) => {
        if (subItem.productId && !isValidUUID(subItem.productId)) {
          errors.push(`${itemType}[${index}].items[${subIndex}]: productId inválido "${subItem.productId}"`);
        }
      });
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valida todos os UUIDs na aplicação
 */
export function validateAllUUIDs(): ValidationResult {
  const allErrors: string[] = [];
  let totalIds = 0;
  let validIds = 0;
  
  console.log('🔍 Validando todos os UUIDs na aplicação...\n');
  
  // Validar produtos
  console.log('📦 Validando produtos...');
  const productsResult = validateIdsInArray(MOCK_PRODUCTS, 'MOCK_PRODUCTS');
  allErrors.push(...productsResult.errors);
  totalIds += MOCK_PRODUCTS.length * 2; // id + companyId
  validIds += (MOCK_PRODUCTS.length * 2) - productsResult.errors.length;
  
  // Validar clientes
  console.log('👥 Validando clientes...');
  const customersResult = validateIdsInArray(MOCK_CUSTOMERS, 'MOCK_CUSTOMERS');
  allErrors.push(...customersResult.errors);
  totalIds += MOCK_CUSTOMERS.length * 2; // id + companyId
  validIds += (MOCK_CUSTOMERS.length * 2) - customersResult.errors.length;
  
  // Validar vendedores
  console.log('👨‍💼 Validando vendedores...');
  const sellersResult = validateIdsInArray(MOCK_SELLERS, 'MOCK_SELLERS');
  allErrors.push(...sellersResult.errors);
  totalIds += MOCK_SELLERS.length * 2; // id + companyId
  validIds += (MOCK_SELLERS.length * 2) - sellersResult.errors.length;
  
  // Validar vendas
  console.log('💰 Validando vendas...');
  const salesResult = validateIdsInArray(MOCK_SALES, 'MOCK_SALES');
  allErrors.push(...salesResult.errors);
  totalIds += MOCK_SALES.length * 4; // id + companyId + customerId + sellerId
  validIds += (MOCK_SALES.length * 4) - salesResult.errors.length;
  
  // Validar contas a pagar
  console.log('💳 Validando contas a pagar...');
  const billsResult = validateIdsInArray(MOCK_BILLS, 'MOCK_BILLS');
  allErrors.push(...billsResult.errors);
  totalIds += MOCK_BILLS.length * 2; // id + companyId
  validIds += (MOCK_BILLS.length * 2) - billsResult.errors.length;
  
  // Validar fechamentos de caixa
  console.log('🏦 Validando fechamentos de caixa...');
  const cashClosuresResult = validateIdsInArray(MOCK_CASH_CLOSURES, 'MOCK_CASH_CLOSURES');
  allErrors.push(...cashClosuresResult.errors);
  totalIds += MOCK_CASH_CLOSURES.length * 3; // id + companyId + sellerId
  validIds += (MOCK_CASH_CLOSURES.length * 3) - cashClosuresResult.errors.length;
  
  // Validar usuários
  console.log('👤 Validando usuários...');
  const usersArray = Object.values(MOCK_USERS).map(u => u.user);
  const usersResult = validateIdsInArray(usersArray, 'MOCK_USERS');
  allErrors.push(...usersResult.errors);
  totalIds += usersArray.length * 2; // id + companyId (se existir)
  validIds += (usersArray.length * 2) - usersResult.errors.length;
  
  const result: ValidationResult = {
    isValid: allErrors.length === 0,
    errors: allErrors,
    summary: {
      totalIds,
      validIds,
      invalidIds: allErrors.length
    }
  };
  
  // Exibir resultados
  console.log('\n📊 Resultados da Validação:');
  console.log(`✅ IDs válidos: ${result.summary.validIds}`);
  console.log(`❌ IDs inválidos: ${result.summary.invalidIds}`);
  console.log(`📈 Total de IDs: ${result.summary.totalIds}`);
  console.log(`🎯 Taxa de sucesso: ${((result.summary.validIds / result.summary.totalIds) * 100).toFixed(1)}%`);
  
  if (result.errors.length > 0) {
    console.log('\n❌ Erros encontrados:');
    result.errors.forEach(error => console.log(`   - ${error}`));
  } else {
    console.log('\n🎉 Todos os UUIDs estão válidos!');
  }
  
  return result;
}

/**
 * Valida especificamente o produto "Ferro 40x40"
 */
export function validateFerro40x40(): boolean {
  console.log('🔧 Validando produto "Ferro 40x40"...');
  
  const ferroProduct = MOCK_PRODUCTS.find(p => p.name === 'Ferro 40x40');
  
  if (!ferroProduct) {
    console.log('❌ Produto "Ferro 40x40" não encontrado!');
    return false;
  }
  
  const isIdValid = isValidUUID(ferroProduct.id);
  const isCompanyIdValid = isValidUUID(ferroProduct.companyId);
  
  console.log(`   ID: ${ferroProduct.id} - ${isIdValid ? '✅' : '❌'}`);
  console.log(`   Company ID: ${ferroProduct.companyId} - ${isCompanyIdValid ? '✅' : '❌'}`);
  
  if (isIdValid && isCompanyIdValid) {
    console.log('✅ Produto "Ferro 40x40" está com UUIDs válidos!');
    return true;
  } else {
    console.log('❌ Produto "Ferro 40x40" tem UUIDs inválidos!');
    return false;
  }
}

/**
 * Executa todos os testes de validação
 */
export function runUUIDValidationTests(): void {
  console.log('🧪 Iniciando testes de validação de UUIDs...\n');
  
  // Teste específico do produto Ferro 40x40
  const ferroValid = validateFerro40x40();
  console.log('');
  
  // Validação geral
  const generalResult = validateAllUUIDs();
  
  console.log('\n🏁 Resumo Final:');
  console.log(`Produto "Ferro 40x40": ${ferroValid ? '✅ Válido' : '❌ Inválido'}`);
  console.log(`Validação geral: ${generalResult.isValid ? '✅ Todos válidos' : '❌ Erros encontrados'}`);
  
  if (ferroValid && generalResult.isValid) {
    console.log('\n🎉 SUCESSO: Todos os UUIDs estão válidos e consistentes!');
  } else {
    console.log('\n⚠️ ATENÇÃO: Foram encontrados problemas com os UUIDs!');
  }
}

// Executar automaticamente se este arquivo for executado diretamente
if (require.main === module) {
  runUUIDValidationTests();
}

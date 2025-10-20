/**
 * Script de teste para verificar se as correções da API estão funcionando
 */

import { fixedApiEndpoints } from './api-fixes';

async function testApiFixes() {
  console.log('🧪 Testando correções da API...\n');
  
  const tests = [
    {
      name: 'Listagem de Produtos',
      test: () => fixedApiEndpoints.productList({ page: 1, limit: 10 }),
      expected: 'array ou objeto com paginação'
    },
    {
      name: 'Busca por Código de Barras',
      test: () => fixedApiEndpoints.productByBarcode('7891234567890'),
      expected: 'null ou objeto produto'
    },
    {
      name: 'Produtos Próximos do Vencimento',
      test: () => fixedApiEndpoints.productExpiring(30),
      expected: 'array de produtos'
    },
    {
      name: 'Estatísticas de Vendas',
      test: () => fixedApiEndpoints.salesStats(),
      expected: 'objeto com estatísticas'
    },
    {
      name: 'Estatísticas do Vendedor',
      test: () => fixedApiEndpoints.sellerStats(),
      expected: 'objeto com estatísticas'
    },
    {
      name: 'Listagem de Empresas',
      test: () => fixedApiEndpoints.companyList(),
      expected: 'array de empresas'
    },
    {
      name: 'Listagem de Administradores',
      test: () => fixedApiEndpoints.adminList(),
      expected: 'array de administradores'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`🔍 Testando: ${test.name}...`);
      const result = await test.test();
      console.log(`✅ ${test.name} - Sucesso`);
      console.log(`   Resultado: ${typeof result} (${Array.isArray(result) ? `array com ${result.length} itens` : 'objeto'})`);
      console.log(`   Esperado: ${test.expected}\n`);
      passed++;
    } catch (error: any) {
      console.log(`❌ ${test.name} - Falhou`);
      console.log(`   Erro: ${error.message}\n`);
      failed++;
    }
  }
  
  console.log('📊 Resumo dos Testes:');
  console.log(`   ✅ Passou: ${passed}`);
  console.log(`   ❌ Falhou: ${failed}`);
  console.log(`   📈 Taxa de Sucesso: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 Todas as correções estão funcionando perfeitamente!');
  } else {
    console.log('\n⚠️ Algumas correções precisam de ajustes.');
  }
}

// Executar testes se chamado diretamente
if (typeof window === 'undefined') {
  testApiFixes().catch(console.error);
}

export { testApiFixes };

/**
 * Script para executar testes reais da API
 * 
 * Este script executa todos os testes da API e gera um relatório completo
 */

import APITester from './api-tests';
import fs from 'fs';
import path from 'path';

async function runAPITests() {
  console.log('🚀 Iniciando testes reais da API MontShop...\n');
  
  const tester = new APITester();
  
  try {
    // Executar todos os testes
    const results = await tester.runAllTests();
    
    // Gerar relatório HTML
    const htmlReport = tester.generateHTMLReport();
    
    // Salvar relatório HTML
    const reportPath = path.join(process.cwd(), 'api-test-report.html');
    fs.writeFileSync(reportPath, htmlReport);
    
    console.log(`\n📄 Relatório HTML salvo em: ${reportPath}`);
    console.log('🌐 Abra o arquivo no navegador para visualizar o relatório completo');
    
    // Salvar relatório JSON
    const jsonReport = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: results.reduce((sum, suite) => sum + suite.totalTests, 0),
        passedTests: results.reduce((sum, suite) => sum + suite.passedTests, 0),
        failedTests: results.reduce((sum, suite) => sum + suite.failedTests, 0),
        totalDuration: results.reduce((sum, suite) => sum + suite.duration, 0),
        successRate: ((results.reduce((sum, suite) => sum + suite.passedTests, 0) / results.reduce((sum, suite) => sum + suite.totalTests, 0)) * 100).toFixed(1)
      },
      modules: results
    };
    
    const jsonPath = path.join(process.cwd(), 'api-test-results.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));
    
    console.log(`📊 Relatório JSON salvo em: ${jsonPath}`);
    
    return results;
  } catch (error) {
    console.error('❌ Erro durante a execução dos testes:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runAPITests().then(() => {
    console.log('\n✅ Testes concluídos!');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Falha nos testes:', error);
    process.exit(1);
  });
}

export default runAPITests;

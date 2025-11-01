'use client';

import React, { useState, useEffect } from 'react';
import { APITester } from '@/lib/api-tests';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, Play, Download, FileText } from 'lucide-react';

interface TestResult {
  module: string;
  test: string;
  success: boolean;
  error?: string;
  data?: any;
  duration: number;
}

interface TestSuite {
  module: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
}

export function APITestRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestSuite[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setIsComplete(false);
    setResults([]);
    setCurrentTest('Executando testes reais da API...');
    setProgress(5);

    try {
      const tester = new APITester();
      const suites = await tester.runAllTests();
      setResults(suites as unknown as TestSuite[]);
      setCurrentTest('Testes concluídos!');
      setProgress(100);
    } catch (error) {
      console.error('Erro executando testes reais:', error);
      setResults([
        {
          module: 'Geral',
          tests: [{
            module: 'Geral',
            test: 'Execução dos testes',
            success: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            duration: 0,
          }],
          totalTests: 1,
          passedTests: 0,
          failedTests: 1,
          duration: 0,
        },
      ]);
      setCurrentTest('Falha ao executar testes');
      setProgress(100);
    }

    setIsRunning(false);
    setIsComplete(true);
  };

  // A execução agora é feita chamando testes reais via APITester; lógica simulada removida.

  const downloadReport = () => {
    const totalTests = results.reduce((sum, suite) => sum + suite.totalTests, 0);
    const totalPassed = results.reduce((sum, suite) => sum + suite.passedTests, 0);
    const totalFailed = results.reduce((sum, suite) => sum + suite.failedTests, 0);
    const totalDuration = results.reduce((sum, suite) => sum + suite.duration, 0);
    const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0';

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        passedTests: totalPassed,
        failedTests: totalFailed,
        totalDuration,
        successRate: `${successRate}%`
      },
      modules: results
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-test-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalTests = results.reduce((sum, suite) => sum + suite.totalTests, 0);
  const totalPassed = results.reduce((sum, suite) => sum + suite.passedTests, 0);
  const totalFailed = results.reduce((sum, suite) => sum + suite.failedTests, 0);
  const totalDuration = results.reduce((sum, suite) => sum + suite.duration, 0);
  const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🧪 Testes da API</h1>
        <p className="text-muted-foreground">Execute testes reais em todas as funcionalidades da API</p>
      </div>

      {/* Controles */}
      <div className="mb-6 flex gap-4">
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          {isRunning ? 'Executando...' : 'Executar Testes'}
        </Button>
        
        {isComplete && (
          <Button 
            onClick={downloadReport}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Baixar Relatório
          </Button>
        )}
      </div>

      {/* Progresso */}
      {isRunning && (
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <Clock className="w-5 h-5 text-blue-500" />
            <div className="flex-1">
              <div className="text-sm font-medium mb-1">{currentTest}</div>
              <Progress value={progress} className="h-2" />
            </div>
            <div className="text-sm text-muted-foreground">{Math.round(progress)}%</div>
          </div>
        </Card>
      )}

      {/* Resumo */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalTests}</div>
            <div className="text-sm text-muted-foreground">Total de Testes</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{totalPassed}</div>
            <div className="text-sm text-muted-foreground">Passou</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{totalFailed}</div>
            <div className="text-sm text-muted-foreground">Falhou</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{successRate}%</div>
            <div className="text-sm text-muted-foreground">Taxa de Sucesso</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{totalDuration}ms</div>
            <div className="text-sm text-muted-foreground">Tempo Total</div>
          </Card>
        </div>
      )}

      {/* Resultados por Módulo */}
      <div className="space-y-4">
        {results.map((suite) => (
          <Card key={suite.module} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">📁 {suite.module}</h3>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-green-600">
                  ✅ {suite.passedTests}
                </Badge>
                <Badge variant="outline" className="text-red-600">
                  ❌ {suite.failedTests}
                </Badge>
                <Badge variant="outline" className="text-blue-600">
                  ⏱️ {suite.duration}ms
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              {suite.tests.map((test, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    test.success 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {test.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <div className="font-medium">{test.test}</div>
                      {test.error && (
                        <div className="text-sm text-red-600">{test.error}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{test.duration}ms</div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

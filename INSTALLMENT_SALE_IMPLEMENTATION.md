# Modal de Vendas a Prazo - Implementação Completa

## Funcionalidades Implementadas

### 1. Modal Específico para Vendas a Prazo
- **Seleção de Cliente**: Interface intuitiva para escolher cliente cadastrado
- **Busca Avançada**: Filtro por nome, CPF/CNPJ ou email
- **Status de Dívidas**: Mostra informações sobre parcelas em atraso
- **Configuração de Parcelas**: Define número de parcelas e valor

### 2. Interface de Configuração
- **Número de Parcelas**: 1 a 24 parcelas
- **Valor Automático**: Cálculo automático do valor por parcela
- **Data de Vencimento**: Seleção da primeira data de vencimento
- **Descrição Opcional**: Campo para observações

### 3. Integração com Sistema de Checkout
- **Abertura Automática**: Modal abre ao selecionar "A prazo"
- **Configuração Automática**: Adiciona método de pagamento automaticamente
- **Validações Integradas**: Verifica cliente e dados de parcelas
- **Resumo Visual**: Mostra informações das parcelas no checkout

### 4. Validações Robustas
- **Cliente Obrigatório**: Deve selecionar cliente para vendas a prazo
- **Dados de Parcelas**: Configuração obrigatória
- **Limites de Parcelas**: Entre 1 e 24 parcelas
- **Data Válida**: Primeira data não pode ser no passado

## Como Usar

### Passo 1: Iniciar Venda
1. Adicione produtos ao carrinho
2. Clique em "Finalizar Venda"

### Passo 2: Configurar Pagamento
1. Clique em "Adicionar" para adicionar método de pagamento
2. Selecione "A prazo" no dropdown
3. O modal de vendas a prazo abrirá automaticamente

### Passo 3: Selecionar Cliente
1. Use a busca para encontrar o cliente
2. Clique no cliente desejado
3. Visualize informações de dívidas existentes

### Passo 4: Configurar Parcelas
1. Selecione número de parcelas (1-24)
2. Confirme a data do primeiro vencimento
3. Adicione descrição opcional
4. Clique em "Confirmar Venda a Prazo"

### Passo 5: Finalizar
1. Verifique o resumo no checkout
2. Complete outros dados se necessário
3. Clique em "Confirmar Venda"

## Exemplos de Uso

### Exemplo 1: Venda Simples a Prazo
```
Total: R$ 300,00
Cliente: João Silva
Parcelas: 3x de R$ 100,00
Primeiro vencimento: 15/02/2025
```

### Exemplo 2: Venda com Cliente com Dívidas
```
Total: R$ 500,00
Cliente: Maria Santos (2 parcelas em atraso - R$ 150,00)
Parcelas: 5x de R$ 100,00
Primeiro vencimento: 20/02/2025
```

### Exemplo 3: Venda Mista com A Prazo
```
Total: R$ 200,00
- Dinheiro: R$ 100,00
- A prazo: R$ 100,00 (2x de R$ 50,00)
Cliente: Pedro Costa
```

## Benefícios

### Para o Vendedor
- **Interface Intuitiva**: Fácil seleção e configuração
- **Informações Completas**: Status de dívidas dos clientes
- **Validações Automáticas**: Previne erros de configuração
- **Integração Perfeita**: Funciona com múltiplos métodos de pagamento

### Para o Cliente
- **Flexibilidade**: Até 24 parcelas
- **Transparência**: Informações claras sobre parcelas
- **Histórico**: Acompanhamento de dívidas existentes

### Para o Sistema
- **Dados Estruturados**: Informações organizadas para relatórios
- **Rastreabilidade**: Histórico completo de vendas a prazo
- **Validações**: Previne inconsistências nos dados

## Arquivos Criados/Modificados

### Novos Arquivos
- `src/components/sales/installment-sale-modal.tsx`: Modal principal
- `INSTALLMENT_SALE_IMPLEMENTATION.md`: Esta documentação

### Arquivos Modificados
- `src/components/sales/checkout-dialog.tsx`: Integração com modal
- `src/lib/validations.ts`: Validações para vendas a prazo
- `src/types/index.ts`: Tipos para dados de parcelas

## Validações Implementadas

1. **Cliente Obrigatório**: Vendas a prazo devem ter cliente
2. **Dados de Parcelas**: Configuração obrigatória
3. **Limites de Parcelas**: Entre 1 e 24 parcelas
4. **Data Válida**: Primeira data não pode ser no passado
5. **Valores Positivos**: Todas as parcelas devem ter valor positivo
6. **Integração**: Validação com sistema de múltiplos pagamentos

A funcionalidade está pronta para uso e oferece uma experiência completa para vendas a prazo! 🚀

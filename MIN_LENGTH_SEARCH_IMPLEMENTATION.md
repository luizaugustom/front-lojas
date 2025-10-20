# Busca com Comprimento Mínimo - Implementação Otimizada

## Funcionalidades Implementadas

### 1. Busca com Comprimento Mínimo
- **Mínimo Configurado**: 3 caracteres para executar busca na API
- **Busca Local**: Funciona com qualquer número de caracteres
- **Busca Remota**: Só executa com 3+ caracteres
- **Otimização**: Evita chamadas desnecessárias à API

### 2. Comportamento Inteligente
- **Menos de 3 caracteres**: Busca apenas localmente nos clientes já carregados
- **3+ caracteres**: Busca local + busca na API com debounce
- **Campo vazio**: Carrega todos os clientes da empresa
- **Atualização automática**: Pausa apenas para buscas com 3+ caracteres

### 3. Indicadores Visuais
- **Placeholder Atualizado**: "Buscar cliente... (mín. 3 caracteres)"
- **Mensagem de Aviso**: "Digite pelo menos 3 caracteres para buscar na API"
- **Status de Busca**: "Buscando clientes da empresa..." quando atinge o mínimo
- **Mensagens Contextuais**: Diferentes mensagens baseadas no comprimento

### 4. Otimizações de Performance
- **Menos Chamadas à API**: Só busca quando realmente necessário
- **Busca Local Rápida**: Resultados imediatos para poucos caracteres
- **Debounce Inteligente**: Aplica delay apenas para buscas válidas
- **Cache Eficiente**: Mantém dados locais para busca rápida

## Como Funciona

### Fluxo de Busca por Comprimento

**0 caracteres:**
- Mostra todos os clientes carregados
- Atualização automática ativa

**1-2 caracteres:**
- Busca apenas localmente
- Não chama a API
- Mostra aviso: "Digite pelo menos 3 caracteres"
- Atualização automática continua

**3+ caracteres:**
- Busca local imediata
- Busca na API com debounce (300ms)
- Mostra: "Buscando clientes da empresa..."
- Atualização automática pausa

### Lógica de Execução
```typescript
if (searchTerm.length < minSearchLength) {
  // Busca apenas local
  const filtered = customers.filter(customer => ...);
  setFilteredCustomers(filtered);
} else {
  // Busca local + API
  const filtered = customers.filter(customer => ...);
  setFilteredCustomers(filtered);
  debouncedSearch(searchTerm); // Chama API
}
```

## Configurações

### Comprimento Mínimo
- **Atual**: 3 caracteres
- **Configurável**: Variável `minSearchLength`
- **Justificativa**: Balance entre precisão e performance

### Debounce
- **Delay**: 300ms
- **Aplicação**: Apenas para buscas com 3+ caracteres
- **Benefício**: Evita chamadas excessivas à API

### Atualização Automática
- **Intervalo**: 5 segundos
- **Pausa**: Apenas para buscas com 3+ caracteres
- **Retomada**: Quando campo fica vazio ou < 3 caracteres

## Benefícios

### Para o Usuário
- **Feedback Imediato**: Resultados locais instantâneos
- **Orientação Clara**: Sabe quantos caracteres precisa
- **Performance**: Interface sempre responsiva
- **Economia**: Menos chamadas à API = menos dados móveis

### Para o Sistema
- **Menos Carga**: Reduz chamadas desnecessárias à API
- **Performance**: Busca local é muito mais rápida
- **Escalabilidade**: Sistema suporta mais usuários simultâneos
- **Eficiência**: Recursos de servidor otimizados

### Para o Negócio
- **Economia**: Menos uso de banda e recursos
- **Velocidade**: Interface mais rápida e responsiva
- **Confiabilidade**: Menos pontos de falha
- **Escalabilidade**: Suporta mais usuários simultâneos

## Exemplos de Uso

### Cenário 1: Busca Gradual
```
Usuário digita "J" → Busca local apenas
Usuário digita "Jo" → Busca local apenas
Usuário digita "Joã" → Busca local + API
```

### Cenário 2: Busca por CPF
```
Usuário digita "12" → Busca local apenas
Usuário digita "123" → Busca local + API
Usuário digita "123.456" → Busca local + API
```

### Cenário 3: Busca por Email
```
Usuário digita "@" → Busca local apenas
Usuário digita "@g" → Busca local apenas
Usuário digita "@gm" → Busca local + API
```

## Estados da Interface

### Input Field
- **Placeholder**: "Buscar cliente... (mín. 3 caracteres)"
- **Validação**: Visual feedback baseado no comprimento
- **Desabilitação**: Durante operações de loading

### Mensagens de Status
- **< 3 caracteres**: "Digite pelo menos 3 caracteres para buscar na API"
- **≥ 3 caracteres**: "Buscando clientes da empresa..."
- **Sem resultados**: Mensagem contextual baseada no comprimento

### Lista de Clientes
- **Busca Local**: Resultados imediatos para qualquer comprimento
- **Busca Remota**: Resultados expandidos para 3+ caracteres
- **Contador**: Mostra quantos clientes foram encontrados

## Implementação Técnica

### Variáveis de Estado
```typescript
const [minSearchLength] = useState(3);
const [searchTerm, setSearchTerm] = useState('');
const [filteredCustomers, setFilteredCustomers] = useState([]);
```

### Função de Debounce
```typescript
const debouncedSearch = useCallback(
  debounce(async (term: string) => {
    if (term.trim().length >= minSearchLength) {
      await loadCustomers(term);
    } else if (term.trim().length === 0) {
      await loadCustomers();
    }
  }, 300),
  [minSearchLength]
);
```

### Lógica de Filtro
```typescript
useEffect(() => {
  if (!searchTerm) {
    setFilteredCustomers(customers);
  } else if (searchTerm.length < minSearchLength) {
    // Busca apenas local
    const filtered = customers.filter(customer => ...);
    setFilteredCustomers(filtered);
  } else {
    // Busca local + API
    const filtered = customers.filter(customer => ...);
    setFilteredCustomers(filtered);
    debouncedSearch(searchTerm);
  }
}, [searchTerm, customers, debouncedSearch, minSearchLength]);
```

A busca com comprimento mínimo está **100% funcional** e otimizada para melhor performance! 🚀

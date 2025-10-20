# Filtros de Produtos

## Funcionalidades Implementadas

### 1. Filtro por Validade Próxima/Vencidos
- **Produtos vencidos**: Produtos cuja data de validade já passou
- **Produtos com validade próxima**: Produtos que vencem nos próximos 30 dias
- **Indicação visual**: 
  - Linha com fundo vermelho para produtos vencidos
  - Linha com fundo laranja para produtos com validade próxima
  - Ícone de alerta vermelho para produtos vencidos
  - Ícone de alerta laranja para produtos com validade próxima

### 2. Filtro por Estoque Baixo
- **Critério**: Produtos com menos de 5 unidades em estoque
- **Indicação visual**:
  - Ícone de alerta laranja ao lado da quantidade

### 3. Interface de Filtros
- **Botão de filtros**: Mostra o número de filtros ativos
- **Painel de filtros**: Interface intuitiva para ativar/desativar filtros
- **Botão "Limpar filtros"**: Remove todos os filtros ativos

## Como Usar

1. **Acesse a página de produtos** (`/products`)
2. **Clique no botão "Filtros"** ao lado da barra de pesquisa
3. **Ative os filtros desejados**:
   - "Produtos com validade próxima/vencidos"
   - "Estoque baixo"
4. **Os produtos serão filtrados automaticamente**
5. **Use "Limpar filtros"** para voltar à visualização completa

## Indicadores Visuais

- 🔴 **Vermelho**: Produtos vencidos (crítico)
- 🟠 **Laranja**: Produtos com validade próxima ou estoque baixo (atenção)
- ⚠️ **Ícones de alerta**: Indicam problemas específicos

## Notas Técnicas

- Os filtros são aplicados no frontend após receber os dados da API
- A lógica de filtros está em `src/lib/productFilters.ts`
- O componente de filtros está em `src/components/products/product-filters.tsx`
- Os filtros funcionam em conjunto com a busca por texto

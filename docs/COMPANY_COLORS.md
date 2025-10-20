# Sistema de Cores da Empresa

Este documento explica como o sistema de cores da empresa funciona na aplicação MontShop.

## Como Funciona

O sistema permite que cada empresa configure sua própria cor de marca (`brandColor`) e essa cor é aplicada automaticamente na interface com 10% de opacidade, substituindo o azul padrão.

### Fluxo de Funcionamento

1. **Busca da Cor**: O hook `useCompany` busca os dados da empresa do usuário logado
2. **Conversão**: A cor hex da empresa é convertida para HSL usando `hexToHsl()`
3. **Aplicação**: A cor é aplicada com 10% de opacidade usando `applyCompanyColor()`
4. **Atualização**: A variável CSS `--primary` é atualizada dinamicamente
5. **Renderização**: Todos os elementos que usam `bg-primary` ou `text-primary` são atualizados

## Arquivos Envolvidos

### Hooks
- `src/hooks/useCompany.ts` - Busca dados da empresa e cor da marca

### Utilitários
- `src/lib/colorUtils.ts` - Funções para conversão e aplicação de cores

### Store
- `src/store/ui-store.ts` - Gerencia estado da cor da empresa

### Componentes
- `src/components/providers.tsx` - Integra o sistema de cores
- `src/app/globals.css` - Classes CSS para cores da empresa

## Classes CSS Disponíveis

### Classes de Background
```css
.company-color-10  /* Cor da empresa com 10% de opacidade */
.company-color-20  /* Cor da empresa com 20% de opacidade */
.company-color-30  /* Cor da empresa com 30% de opacidade */
```

### Uso nos Componentes
```tsx
// Exemplo de uso em um componente
<div className="company-color-10 p-4 rounded-lg">
  <span className="text-primary">Conteúdo com cor da empresa</span>
</div>
```

## Estrutura de Dados

### Interface Company
```typescript
interface Company {
  id: string;
  name: string;
  // ... outros campos
  brandColor?: string; // Cor da empresa em formato hex (ex: "#FF5733")
}
```

### Funções Utilitárias

#### `hexToHsl(hex: string)`
Converte cor hex para HSL
```typescript
const hsl = hexToHsl("#FF5733");
// Retorna: { h: 9, s: 100, l: 60 }
```

#### `applyCompanyColor(brandColor: string | null)`
Aplica cor da empresa com 10% de opacidade
```typescript
const primaryColor = applyCompanyColor("#FF5733");
// Retorna: "9 10% 95%" (formato HSL para CSS)
```

## Exemplo Prático

### No Sidebar
```tsx
{/* Área de destaque da empresa */}
{!sidebarCollapsed && (
  <div className="mx-3 mt-3 rounded-lg company-color-10 p-3 border border-primary/20">
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 rounded-full bg-primary"></div>
      <span className="text-xs font-medium text-primary">Sua Empresa</span>
    </div>
  </div>
)}
```

## Fallback

Quando não há cor da empresa configurada, o sistema usa a cor azul padrão:
- **Cor padrão**: `221.2 83.2% 53.3%` (azul)
- **Com 10% opacidade**: Aplicada automaticamente pela função `applyCompanyColor()`

## Configuração da Empresa

Para configurar a cor da empresa, o campo `brandColor` deve ser definido no cadastro da empresa com uma cor em formato hex válido (ex: `#FF5733`, `#00FF00`, etc.).

## Compatibilidade

- ✅ Funciona com tema claro e escuro
- ✅ Atualização automática quando a cor da empresa muda
- ✅ Fallback para cor padrão quando não há cor configurada
- ✅ Suporte a cores hex válidas
- ✅ Aplicação em tempo real sem necessidade de reload

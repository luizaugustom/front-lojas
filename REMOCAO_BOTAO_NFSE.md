# Remoção do Botão de NFSe

## Resumo das Alterações

Foi solicitada a remoção do botão de NFSe (Nota Fiscal de Serviço Eletrônica) da aplicação. Todas as funcionalidades relacionadas ao NFSe foram removidas, mantendo apenas a funcionalidade de NF-e (Nota Fiscal Eletrônica).

## Arquivos Modificados

### 1. `src/app/(dashboard)/invoices/page.tsx`

#### ✅ **Botão Removido**
- Removido o botão "Emitir NFS-e" da interface
- Mantido apenas o botão "Emitir NF-e"

#### ✅ **Estado Simplificado**
- Removidas variáveis de estado relacionadas ao NFSe:
  - `serviceDescription`
  - `serviceAmount`
- Simplificado o tipo `emitType` para aceitar apenas `'nfe'`

#### ✅ **Funções Atualizadas**
- `openEmitDialog()`: Simplificada para aceitar apenas tipo 'nfe'
- `submitEmit()`: Removida lógica de emissão de NFSe
- Reset de campos simplificado

#### ✅ **Interface Limpa**
- Removida seção do diálogo específica para NFSe
- Simplificado título do diálogo para "Emitir NF-e"
- Atualizada descrição da página para "Visualize e baixe suas NF-e"

#### ✅ **Imports Atualizados**
- Adicionado import do componente `Input` necessário

### 2. `src/lib/api-endpoints.ts`

#### ✅ **Endpoint Removido**
- Removido endpoint `generateNFSe` da API fiscal
- Mantido apenas o endpoint `generateNFe`

## Funcionalidades Mantidas

### ✅ **NF-e (Nota Fiscal Eletrônica)**
- Botão "Emitir NF-e" mantido
- Funcionalidade de emissão de NF-e preservada
- Campo opcional para ID da venda mantido
- Download e visualização de NF-e mantidos

### ✅ **Interface Fiscal**
- Listagem de documentos fiscais mantida
- Busca por chave de acesso mantida
- Download de documentos mantido
- Atualização da lista mantida

## Resultado Final

### 🎯 **Interface Simplificada**
- Apenas um botão de emissão: "Emitir NF-e"
- Diálogo simplificado com apenas campos para NF-e
- Descrição atualizada para refletir apenas NF-e

### 🧹 **Código Limpo**
- Removidas todas as referências ao NFSe
- Variáveis de estado desnecessárias removidas
- Lógica simplificada e mais focada

### 📱 **Experiência do Usuário**
- Interface mais limpa e focada
- Menos opções para evitar confusão
- Funcionalidade de NF-e totalmente preservada

## Compatibilidade

### ✅ **Backend**
- Remoção não afeta endpoints existentes do backend
- Endpoint `/fiscal/nfse` ainda existe no backend (apenas não é usado no frontend)
- Funcionalidade de NF-e continua funcionando normalmente

### ✅ **Dados Existentes**
- Documentos NFSe já emitidos continuam sendo exibidos na listagem
- Funcionalidade de download de NFSe mantida
- Apenas a emissão de novos NFSe foi removida

---

**Status**: ✅ **CONCLUÍDO**

**Arquivos Afetados**: 2
**Funcionalidades Removidas**: Emissão de NFSe
**Funcionalidades Mantidas**: Emissão e visualização de NF-e

**Resultado**: Interface mais limpa e focada apenas em NF-e, conforme solicitado.

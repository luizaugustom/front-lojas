# Reativar Ponto Eletrônico no menu

## Objetivo

Voltar a exibir o acesso **Ponto Eletrônico** no menu lateral do sistema web.

## Alteração

Remover `Ponto Eletrônico` do conjunto `hiddenMenuItems` em
`src/components/layout/sidebar.tsx`.

O item de navegação já existe com a rota `/time-clock`, o ícone `Clock` e as
permissões para `vendedor`, `empresa`, `admin` e `gestor`. Esses dados serão
preservados.

## Comportamento esperado

Usuários com um dos perfis autorizados verão **Ponto Eletrônico** no menu e,
ao selecioná-lo, acessarão a página unificada de ponto existente.

## Verificação

- Confirmar que o item não é mais filtrado pelo menu.
- Executar as verificações estáticas disponíveis para o arquivo alterado.


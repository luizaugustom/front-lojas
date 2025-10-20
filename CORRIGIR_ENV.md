# 🔧 CORREÇÃO URGENTE NECESSÁRIA

## Problema Identificado

O arquivo `.env.local` está com a URL incorreta da API:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api  ❌ ERRADO
```

## Solução

**Abra o arquivo `.env.local` e altere para:**

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=MontShop
NEXT_PUBLIC_VERSION=1.0.0
```

## Por que isso é importante?

- A API está rodando na porta **3000**
- O frontend está rodando na porta **3001**
- A URL **NÃO** deve conter `/api` no final
- Os endpoints são acessados diretamente (ex: `http://localhost:3000/auth/login`)

## Após corrigir

1. Salve o arquivo `.env.local`
2. Reinicie o servidor Next.js:
   ```bash
   npm run dev
   ```
3. Teste o login novamente

## Verificação

Após reiniciar, abra o Console do navegador (F12) e você deve ver:
```
[API Client] Configuração: {API_BASE_URL: 'http://localhost:3000', USE_HTTPS: false}
```

Se ainda aparecer outra URL, o arquivo não foi salvo corretamente ou o servidor não foi reiniciado.

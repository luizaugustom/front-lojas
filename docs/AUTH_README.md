# Módulo de Autenticação (JWT + Refresh por Cookie httpOnly)

Este módulo implementa autenticação completa no frontend (Next.js/React) usando Axios + interceptors, com refresh automático do access token por cookie httpOnly gerenciado pelo backend.

## Arquivos adicionados

- `src/lib/apiClient.ts` — Cliente Axios com:
  - `withCredentials = true` e `baseURL` configurável por env.
  - Interceptor de request adicionando `Authorization: Bearer <accessToken>` quando houver.
  - Interceptor de response que:
    - Captura `401` e dispara `POST /auth/refresh` apenas uma vez, enfileirando requisições paralelas.
    - Atualiza token em memória e re-executa a requisição original.
    - Em caso de falha, limpa token e notifica listeners de logout.
  - Funções `authLogin`, `authLogout`, `authRefresh`.
- `src/contexts/AuthContext.tsx` — React Context/Provider que mantém `user` e `accessToken` em memória, tenta refresh silencioso no mount, e expõe `login`, `logout`, `getAccessToken`, `api`.
- `src/hooks/useAuth.tsx` — Hook utilitário que retorna `{ user, isAuthenticated, login, logout, getAccessToken, api }`.
- `src/components/LoginForm.tsx` — Exemplo simples de login com validação.
- `src/app/(dashboard)/company-example/page.tsx` — Exemplo de página protegida consumindo `GET /company` usando `api`.
- `src/components/providers.tsx` — Integrado `AuthProvider` ao provedor global.

## Variáveis de ambiente

- `NEXT_PUBLIC_API_BASE_URL` (ou `NEXT_PUBLIC_API_URL`): URL base do backend. Ex.: `http://localhost:3000`.
- `NEXT_PUBLIC_USE_HTTPS` (opcional): `true`/`false` para indicar uso de HTTPS (apenas informativo).

Observação: Cookies httpOnly devem ser emitidos pelo backend com `SameSite=strict` e `Secure` em produção.

## Boas práticas de segurança adotadas

- Refresh token NUNCA é salvo no navegador. É mantido apenas em cookie httpOnly pelo servidor.
- Access token é mantido apenas em memória (variável de módulo/estado do React) e NÃO em `localStorage`.
- Interceptor de response implementa fila para evitar avalanche de `refresh` em múltiplos `401` simultâneos.
- Em falha de refresh: token é limpo, listeners são notificados e o erro é propagado para que a UI realize logout.

## Fluxos suportados

- Login: `POST /auth/login` com `{ login, password }` retorna `{ access_token, user }` e o servidor seta o cookie `refresh_token` (httpOnly). O módulo guarda apenas `access_token` em memória.
- Refresh: em `401`, o interceptor faz `POST /auth/refresh` (sem body, com credenciais), atualiza `access_token` e re-tenta a requisição original.
- Logout: `POST /auth/logout` revoga o refresh token e limpa cookie. O frontend limpa o access token em memória e o estado do usuário.

## Testes manuais com curl

No Windows PowerShell usando cookie jar (via curl nativo do Windows 10/11):

```powershell
# Substitua a URL base conforme o seu backend
$BASE = "http://localhost:3000"

# Login: salva cookie httpOnly (refresh_token) no cookie jar (arquivo)
curl -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d '{"login":"seuLogin","password":"suaSenha"}' -c cookies.txt

# Usar o access_token retornado no corpo para chamadas autenticadas
# Ex.: GET /company
$ACCESS = "<cole aqui o access_token do response>"
curl "$BASE/company" -H "Authorization: Bearer $ACCESS" -b cookies.txt

# Forçar refresh: após expirar o access token, tentar endpoint protegido; backend responderá 401, e então:
# Dispare manualmente o refresh (só para teste):
curl -X POST "$BASE/auth/refresh" -b cookies.txt -c cookies.txt

# Logout
curl -X POST "$BASE/auth/logout" -b cookies.txt -c cookies.txt
```

Observação: No navegador, o cookie httpOnly não é acessível via JS. O Axios envia-o automaticamente com `withCredentials: true`.

## Como usar no código

- Em componentes, use o hook:

```tsx
import { useAuth } from '@/hooks/useAuth';

function MinhaPagina() {
  const { user, isAuthenticated, api, logout } = useAuth();
  // ...
}
```

- Para login:

```tsx
const { login } = useAuth();
await login(loginStr, passwordStr);
```

- Para chamadas autenticadas:

```tsx
const { api } = useAuth();
const res = await api.get('/company');
```

## Notas de migração

O projeto possuía uma store `zustand` com armazenamento em `localStorage` para token/usuário. Este módulo substitui o fluxo de autenticação e deixa o estado em memória para o `accessToken`. Se desejar, remova gradualmente usos de `useAuthStore` e `src/lib/auth.ts` em favor de `useAuth()` e `api` deste módulo.

## Dicas de produção

- Certifique-se que o backend define `Secure` nos cookies quando servido via HTTPS.
- Configure CORS para permitir `credentials` e a origem do frontend.
- Garanta rotação do refresh token no `/auth/refresh` (conforme contrato) para mitigar replay.
- Considere reduzir o tempo de vida do access token (ex.: 5-15 min) e refresh token mais longo.

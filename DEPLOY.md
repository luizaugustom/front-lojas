# Guia de Deploy - MontShop Frontend

Este guia contém informações sobre como fazer o deploy da aplicação MontShop em produção.

## Pré-requisitos

- Node.js 18+ instalado
- Conta na Vercel ou acesso ao servidor de produção
- Configuração da API backend

## Deploy na Vercel

### 1. Configuração Inicial

1. Crie uma conta na [Vercel](https://vercel.com)
2. Importe o repositório do GitHub/GitLab
3. Configure as variáveis de ambiente

### 2. Variáveis de Ambiente

Configure as seguintes variáveis de ambiente na Vercel:

#### Obrigatórias:
```
NEXT_PUBLIC_API_BASE_URL=https://sua-api.com
NEXT_PUBLIC_API_URL=https://sua-api.com
NEXT_PUBLIC_USE_HTTPS=true
```

#### Opcionais:
```
NEXT_PUBLIC_ERROR_API_ENDPOINT=https://seu-endpoint.com/api/errors
NEXT_PUBLIC_DEBUG=false
```

### 3. Deploy

1. Faça push para a branch `main` ou `master`
2. A Vercel fará o deploy automaticamente
3. Monitore os logs do build

### 4. Configurações Adicionais

O arquivo `vercel.json` já está configurado com:
- Headers de segurança
- Compressão
- Otimizações de produção

## Deploy Manual (VPS/Docker)

### 1. Build da Aplicação

```bash
npm install
npm run build
```

### 2. Variáveis de Ambiente

Copie `.env.example` para `.env.production` e configure:

```bash
cp .env.example .env.production
nano .env.production
```

### 3. Executar em Produção

```bash
npm start
```

Ou usando PM2:

```bash
pm2 start npm --name "montshop-frontend" -- start
```

### 4. Configurar Nginx (Recomendado)

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Headers de segurança
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}
```

### 5. SSL/HTTPS

Configure SSL com Let's Encrypt:

```bash
certbot --nginx -d seu-dominio.com
```

## Otimizações de Produção

### Já Implementadas

- ✅ Remoção de logs de debug em produção
- ✅ Minificação de código
- ✅ Compressão gzip/brotli
- ✅ Headers de segurança
- ✅ Lazy loading de componentes
- ✅ Code splitting automático
- ✅ Otimização de imagens

### Verificações

Após o deploy, verifique:

- [ ] API está conectando corretamente
- [ ] Autenticação funcionando
- [ ] PWA está instalável
- [ ] Métricas de performance
- [ ] Logs de erro (se configurado)

## Monitoramento

### Vercel Analytics

A Vercel fornece analytics integrados. Habilite no painel:

1. Vá para Settings > Analytics
2. Habilite Web Analytics
3. Configure domínios

### Error Logging

Configure o endpoint de erros para receber logs:

```env
NEXT_PUBLIC_ERROR_API_ENDPOINT=https://seu-endpoint.com/api/errors
```

## Rollback

### Vercel

1. Vá para Deployments
2. Encontre o deployment anterior
3. Clique em "Promote to Production"

### Manual

```bash
git checkout <commit-anterior>
npm run build
pm2 restart montshop-frontend
```

## Troubleshooting

### Build Falha

- Verifique variáveis de ambiente
- Verifique logs do build
- Teste build local: `npm run build`

### API não Conecta

- Verifique `NEXT_PUBLIC_API_BASE_URL`
- Verifique CORS no backend
- Verifique certificados SSL

### Performance Ruim

- Habilite Vercel Analytics
- Verifique Web Vitals
- Otimize imagens
- Verifique bundle size

## Suporte

Para mais informações:
- Documentação: https://nextjs.org/docs/deployment
- Vercel Docs: https://vercel.com/docs
- Logs de produção: Vercel Dashboard > Deployments


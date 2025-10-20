# Guia de Deploy - MontShop Frontend

## Deploy na Vercel (Recomendado)

### 1. Preparação

1. Certifique-se de que o projeto está no GitHub, GitLab ou Bitbucket
2. Crie uma conta na [Vercel](https://vercel.com)

### 2. Deploy

1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard)
2. Clique em "Add New Project"
3. Importe seu repositório
4. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_APP_NAME`
   - `NEXT_PUBLIC_VERSION`
5. Clique em "Deploy"

### 3. Configurações Adicionais

#### Domínio Customizado
1. Vá em "Settings" > "Domains"
2. Adicione seu domínio
3. Configure o DNS conforme instruções

#### Variáveis de Ambiente
1. Vá em "Settings" > "Environment Variables"
2. Adicione todas as variáveis necessárias
3. Separe por ambiente (Production, Preview, Development)

## Deploy em Servidor VPS

### 1. Requisitos

- Node.js 18+ instalado
- PM2 para gerenciamento de processos
- Nginx como proxy reverso

### 2. Instalação no Servidor

```bash
# Clone o repositório
git clone <repository-url>
cd front-lojas

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
nano .env.local

# Build da aplicação
npm run build

# Instale o PM2 globalmente
npm install -g pm2

# Inicie a aplicação com PM2
    pm2 start npm --name "montshop-frontend" -- start
pm2 save
pm2 startup
```

### 3. Configuração do Nginx

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. SSL com Let's Encrypt

```bash
# Instale o Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenha o certificado SSL
sudo certbot --nginx -d seu-dominio.com

# Renovação automática
sudo certbot renew --dry-run
```

## Deploy no Netlify

### 1. Configuração

1. Crie uma conta no [Netlify](https://netlify.com)
2. Conecte seu repositório
3. Configure o build:
   - Build command: `npm run build`
   - Publish directory: `.next`

### 2. Variáveis de Ambiente

1. Vá em "Site settings" > "Build & deploy" > "Environment"
2. Adicione as variáveis de ambiente

### 3. Deploy Contínuo

O Netlify fará deploy automático a cada push no branch principal.

## Otimizações de Produção

### 1. Performance

- Habilite compressão Gzip/Brotli
- Configure cache de assets estáticos
- Use CDN para assets
- Otimize imagens

### 2. Segurança

- Configure HTTPS
- Adicione headers de segurança
- Configure CORS adequadamente
- Use variáveis de ambiente para secrets

### 3. Monitoramento

- Configure logs de erro
- Use ferramentas de APM (Application Performance Monitoring)
- Configure alertas de uptime

## Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Build de produção testado localmente
- [ ] SSL/HTTPS configurado
- [ ] Domínio configurado
- [ ] Backup configurado
- [ ] Monitoramento configurado
- [ ] Logs configurados
- [ ] Performance otimizada
- [ ] Segurança revisada

## Troubleshooting

### Erro de Build

```bash
# Limpe o cache e reinstale
rm -rf node_modules .next
npm install
npm run build
```

### Erro de Variáveis de Ambiente

Certifique-se de que todas as variáveis começam com `NEXT_PUBLIC_` para serem acessíveis no cliente.

### Erro 404 em Rotas

Configure o servidor para redirecionar todas as rotas para `index.html` (SPA mode).

## Suporte

Para problemas ou dúvidas sobre o deploy, consulte:
- [Documentação Next.js](https://nextjs.org/docs/deployment)
- [Documentação Vercel](https://vercel.com/docs)
- Issues do projeto no GitHub

# Script para configurar .env.local
$envContent = @"
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=MontShop
NEXT_PUBLIC_VERSION=1.0.0
"@

$envContent | Out-File -FilePath ".env.local" -Encoding utf8
Write-Host "✅ Arquivo .env.local criado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Configurações aplicadas:" -ForegroundColor Cyan
Write-Host "  API URL: http://localhost:3000/api" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Reinicie o servidor Next.js:" -ForegroundColor Yellow
Write-Host "  1. Pressione Ctrl+C para parar o servidor" -ForegroundColor White
Write-Host "  2. Execute: npm run dev" -ForegroundColor White
